import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'birthdays';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const excludeId = searchParams.get('excludeId');

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name parameter is required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Build query to check for duplicate name (case-insensitive)
    const query: any = {
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    };

    // If excluding a specific ID (for updates), add that to the query
    if (excludeId) {
      try {
        query._id = { $ne: new ObjectId(excludeId) };
      } catch (error) {
        // Invalid ObjectId format
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid excludeId format' 
        }, { status: 400 });
      }
    }

    const existingBirthday = await collection.findOne(query);

    return NextResponse.json({ 
      success: true, 
      exists: !!existingBirthday 
    });
  } catch (error) {
    console.error('Error checking duplicate birthday:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 