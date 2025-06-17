import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'birthdays';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const birthdays = await collection.find({}).toArray();

    // Convert MongoDB _id to id and ensure dates are properly formatted
    const formattedBirthdays = birthdays.map((birthday: any) => ({
      id: birthday._id.toString(),
      name: birthday.name,
      birthDate: birthday.birthDate,
      originalYear: birthday.originalYear,
      notes: birthday.notes,
      reminderDays: birthday.reminderDays,
      addedBy: birthday.addedBy,
      addedByUserId: birthday.addedByUserId,
      createdAt: birthday.createdAt,
      updatedAt: birthday.updatedAt,
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedBirthdays 
    });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, birthDate, originalYear, notes, reminderDays, addedBy, addedByUserId } = body;

    // Validate required fields
    if (!name || !birthDate || !addedBy || !addedByUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check for duplicate name
    const existingBirthday = await collection.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive match
    });

    if (existingBirthday) {
      return NextResponse.json({ 
        success: false, 
        error: `A birthday for "${name}" already exists` 
      }, { status: 409 });
    }

    const birthdayData = {
      name: name.trim(),
      birthDate: new Date(birthDate),
      originalYear: originalYear || undefined,
      notes: notes?.trim() || undefined,
      reminderDays: reminderDays || 7,
      addedBy,
      addedByUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(birthdayData);

    // Return the created birthday with the MongoDB _id converted to id
    const createdBirthday = {
      id: result.insertedId.toString(),
      ...birthdayData,
    };

    return NextResponse.json({ 
      success: true, 
      data: createdBirthday 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating birthday:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 