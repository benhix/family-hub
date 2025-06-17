import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { petType, mealTime, fed, triggeredBy, triggeredByUserId } = await request.json();

    if (!petType || !mealTime || fed === undefined) {
      return NextResponse.json(
        { error: 'Pet type, meal time, and fed status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('pet_feeding');

    // Use Adelaide time (UTC+10:30/+9:30 depending on daylight saving)
    const now = new Date();
    const adelaideTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Adelaide"}));
    const dateString = adelaideTime.toISOString().split('T')[0]; // YYYY-MM-DD format

    const feedingRecord = {
      petType: petType.toLowerCase(), // 'dog' or 'cat'
      mealTime: mealTime.toLowerCase(), // 'morning' or 'evening'
      fed: Boolean(fed),
      date: dateString,
      triggeredBy: triggeredBy || 'Manual',
      triggeredByUserId: triggeredByUserId || null,
      timestamp: adelaideTime,
      source: 'manual', // Mark manual entries
    };

    // Check if a record already exists for this pet, meal, and date
    const existingRecord = await collection.findOne({
      petType: feedingRecord.petType,
      mealTime: feedingRecord.mealTime,
      date: dateString,
    });

    let result;
    if (existingRecord) {
      // Update existing record
      result = await collection.updateOne(
        {
          petType: feedingRecord.petType,
          mealTime: feedingRecord.mealTime,
          date: dateString,
        },
        {
          $set: {
            fed: feedingRecord.fed,
            triggeredBy: feedingRecord.triggeredBy,
            triggeredByUserId: feedingRecord.triggeredByUserId,
            timestamp: feedingRecord.timestamp,
            source: feedingRecord.source,
          }
        }
      );
    } else {
      // Create new record
      result = await collection.insertOne(feedingRecord);
    }

    return NextResponse.json({
      success: true,
      message: 'Feeding status updated successfully',
      data: feedingRecord,
    });
  } catch (error) {
    console.error('Error updating feeding status:', error);
    return NextResponse.json(
      { error: 'Failed to update feeding status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('pet_feeding');

    const { searchParams } = new URL(request.url);
    const petType = searchParams.get('petType');
    const days = parseInt(searchParams.get('days') || '7');

    // Use Adelaide time for date calculations
    const now = new Date();
    const adelaideTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Adelaide"}));
    const endDate = adelaideTime;
    const startDate = new Date(adelaideTime.getTime());
    startDate.setDate(endDate.getDate() - days);

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // Build filter
    const filter: any = {
      date: {
        $gte: startDateString,
        $lte: endDateString,
      }
    };
    if (petType) filter.petType = petType.toLowerCase();

    const feedingRecords = await collection
      .find(filter)
      .sort({ date: -1, timestamp: -1 })
      .toArray();

    // Get today's status for quick access using Adelaide time
    const today = endDateString; // Already calculated with Adelaide time
    const todayRecords = await collection
      .find({ date: today })
      .toArray();

    /* console.log(`DEBUG: Today's date: ${today}`);
    console.log(`DEBUG: Found ${todayRecords.length} records for today:`, todayRecords); */

    // Initialize today's status - this ensures we start fresh each day
    const todayStatus = {
      dog: {
        morning: false,
        evening: false,
      },
      cat: {
        morning: false,
        evening: false,
      }
    };

    // Only update status if records exist for today - use the LATEST record for each pet/meal combination
    const latestRecords = new Map();
    
    // Sort by timestamp descending to get latest first
    todayRecords
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .forEach(record => {
        const key = `${record.petType}-${record.mealTime}`;
        if (!latestRecords.has(key)) {
          latestRecords.set(key, record);
        }
      });

    // console.log(`DEBUG: Latest records map:`, Array.from(latestRecords.entries()));

    // Apply the latest status for each pet/meal combination
    latestRecords.forEach((record) => {
      if (record.petType === 'dog') {
        if (record.mealTime === 'morning') todayStatus.dog.morning = record.fed;
        if (record.mealTime === 'evening') todayStatus.dog.evening = record.fed;
      }
      if (record.petType === 'cat') {
        if (record.mealTime === 'morning') todayStatus.cat.morning = record.fed;
        if (record.mealTime === 'evening') todayStatus.cat.evening = record.fed;
      }
    });

    //console.log(`DEBUG: Final todayStatus:`, todayStatus);

    // Convert MongoDB ObjectIds to strings
    const formattedRecords = feedingRecords.map(record => ({
      ...record,
      id: record._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ 
      feedingRecords: formattedRecords,
      todayStatus,
      totalRecords: formattedRecords.length,
      currentDate: today
    });
  } catch (error) {
    console.error('Error fetching feeding records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeding records' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('pet_feeding');

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset_today') {
      // Reset today's feeding status - used for midnight reset using Adelaide time
      const now = new Date();
      const adelaideTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Adelaide"}));
      const today = adelaideTime.toISOString().split('T')[0];
      
      // Delete today's records to reset status
      const result = await collection.deleteMany({
        date: today
      });

      return NextResponse.json({
        success: true,
        message: 'Today\'s feeding status reset successfully',
        deletedCount: result.deletedCount
      });
    }

    if (action === 'cleanup_duplicates') {
      // Find and remove duplicate records, keeping only the latest one for each pet/meal/date combination
      const allRecords = await collection.find({}).toArray();
      
      // Group records by pet/meal/date combination
      const recordGroups = new Map();
      
      allRecords.forEach(record => {
        const key = `${record.petType}-${record.mealTime}-${record.date}`;
        if (!recordGroups.has(key)) {
          recordGroups.set(key, []);
        }
        recordGroups.get(key).push(record);
      });

      let deletedCount = 0;
      
      // For each group, keep only the latest record and delete the rest
      for (const [key, records] of Array.from(recordGroups.entries())) {
        if (records.length > 1) {
          // Sort by timestamp descending (latest first)
          records.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Keep the first (latest) record, delete the rest
          const recordsToDelete = records.slice(1);
          
          for (const record of recordsToDelete) {
            await collection.deleteOne({ _id: record._id });
            deletedCount++;
          }
          
          // console.log(`Cleaned up ${recordsToDelete.length} duplicate records for ${key}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} duplicate records`,
        deletedCount: deletedCount
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=reset_today or ?action=cleanup_duplicates' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in DELETE operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform DELETE operation' },
      { status: 500 }
    );
  }
} 