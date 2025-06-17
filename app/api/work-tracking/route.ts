import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { date, status } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('work_tracking');

    const workEntry = {
      date,
      status: status || '',
      timestamp: new Date(),
    };

    // Check if a record already exists for this date
    const existingRecord = await collection.findOne({ date });

    let result;
    if (existingRecord) {
      // Update existing record
      result = await collection.updateOne(
        { date },
        {
          $set: {
            status: workEntry.status,
            timestamp: workEntry.timestamp,
          }
        }
      );
    } else {
      // Create new record
      result = await collection.insertOne(workEntry);
    }

    return NextResponse.json({
      success: true,
      message: 'Work status updated successfully',
      data: workEntry,
    });
  } catch (error) {
    console.error('Error updating work status:', error);
    return NextResponse.json(
      { error: 'Failed to update work status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('work_tracking');

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    if (!weekStart) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      );
    }

    // Calculate the date range for the work week (Monday to Friday)
    const startDate = new Date(weekStart);
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Fetch work entries for the week
    const workEntries = await collection
      .find({ date: { $in: dates } })
      .toArray();

    // Convert to a map for easy access
    const weekData: { [key: string]: any } = {};
    workEntries.forEach(entry => {
      weekData[entry.date] = {
        date: entry.date,
        status: entry.status,
        timestamp: entry.timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      weekData,
      weekStart,
      dates,
    });
  } catch (error) {
    console.error('Error fetching work tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work tracking data' },
      { status: 500 }
    );
  }
} 