import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { CreateActivityRequest, ActivityFilters } from '@/app/types/activity';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'activities';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as ActivityFilters['type'];

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const whereClause: any = {};
    if (type) {
      whereClause.type = type;
    }

    const activities = await collection
      .find(whereClause)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Convert MongoDB ObjectId to string for JSON serialization
    const activitiesWithStringIds = activities.map(activity => {
      const { _id, ...activityWithoutId } = activity;
      return {
        ...activityWithoutId,
        id: _id.toString(),
      };
    });

    return NextResponse.json(activitiesWithStringIds);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateActivityRequest = await request.json();
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const now = new Date();
    const activity = {
      message: body.message,
      type: body.type,
      userName: body.userName,
      userId: body.userId,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(activity);
    
    const createdActivity = {
      ...activity,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(createdActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Clear all activities
    await collection.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing activities:', error);
    return NextResponse.json({ error: 'Failed to clear activities' }, { status: 500 });
  }
} 