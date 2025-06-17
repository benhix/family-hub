import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ConfigDocument, UpdateConfigRequest, documentsToConfig } from '@/app/types/config';

// GET - Fetch all config settings
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('hicks-hub');
    const configCollection = db.collection<ConfigDocument>('config');

    // Get all config documents
    const configDocs = await configCollection.find({}).toArray();
    
    // Convert to frontend format
    const config = documentsToConfig(configDocs);

    return NextResponse.json({ 
      success: true, 
      data: config 
    });

  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PATCH - Update a config setting
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateConfigRequest = await request.json();
    const { name, value } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Config name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('hicks-hub');
    const configCollection = db.collection<ConfigDocument>('config');

    const now = new Date();

    // Upsert the config setting
    await configCollection.updateOne(
      { name },
      {
        $set: {
          name,
          value,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Fetch updated config
    const configDocs = await configCollection.find({}).toArray();
    const config = documentsToConfig(configDocs);

    return NextResponse.json({ 
      success: true, 
      data: config 
    });

  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update config' },
      { status: 500 }
    );
  }
} 