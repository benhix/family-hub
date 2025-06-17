import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { qrCode, triggeredBy, triggeredByUserId } = await request.json();

    // Verify this is our specific pet feeding QR code
    if (qrCode !== 'FAMILY_DASH_PET_FEEDING_BOTH') {
      return NextResponse.json(
        { error: 'Invalid QR code. Please scan the correct pet feeding QR code.' },
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
    
    // Determine current meal time using Adelaide time
    // Morning: 6am to 3pm (6-14 hours)
    // Evening: 3pm to 6am next day (15-23 hours and 0-5 hours)
    const hour = adelaideTime.getHours();
    const isMorningHours = hour >= 6 && hour < 15;
    const mealTime = isMorningHours ? 'morning' : 'evening';
    
    console.log(`DEBUG QR: Adelaide time: ${adelaideTime}, Hour: ${hour}, Meal time: ${mealTime}`);

    // Check if pets are already fed for the CURRENT meal time only
    const existingFedRecords = await collection.find({
      mealTime: mealTime,
      date: dateString,
      fed: true,
      petType: { $in: ['dog', 'cat'] }
    }).toArray();

    console.log(`DEBUG QR: Found ${existingFedRecords.length} existing fed records for ${mealTime} on ${dateString}:`, existingFedRecords.map(r => `${r.petType}-${r.mealTime}-${r.fed}`));

    // Count unique pets that are already fed for this meal time
    const fedPetTypes = Array.from(new Set(existingFedRecords.map(record => record.petType)));
    
    console.log(`DEBUG QR: Fed pet types: ${fedPetTypes.join(', ')} (${fedPetTypes.length} total)`);
    
    // If both pets are already fed for the current meal time, return already fed response
    if (fedPetTypes.length >= 2) {
      console.log(`DEBUG QR: Both pets already fed for ${mealTime}, returning 409`);
      return NextResponse.json({
        success: false,
        alreadyFed: true,
        message: `Both pets already fed for ${mealTime}`,
        mealTime: mealTime,
        date: dateString,
        pets: ['dog', 'cat']
      }, { status: 409 }); // 409 Conflict status
    }

    // Create feeding records for both pets using upsert to maintain compatibility with manual toggle
    const timestamp = adelaideTime;
    const feedingRecords = [
      {
        petType: 'dog',
        mealTime: mealTime,
        fed: true,
        date: dateString,
        triggeredBy: triggeredBy || 'QR Code',
        triggeredByUserId: triggeredByUserId || null,
        timestamp: timestamp,
        source: 'qr_code'
      },
      {
        petType: 'cat',
        mealTime: mealTime,
        fed: true,
        date: dateString,
        triggeredBy: triggeredBy || 'QR Code',
        triggeredByUserId: triggeredByUserId || null,
        timestamp: timestamp,
        source: 'qr_code'
      }
    ];

    // Update or insert records for both pets (using upsert to maintain compatibility)
    const updatePromises = feedingRecords.map(record => 
      collection.updateOne(
        {
          petType: record.petType,
          mealTime: record.mealTime,
          date: dateString,
        },
        {
          $set: {
            fed: record.fed,
            triggeredBy: record.triggeredBy,
            triggeredByUserId: record.triggeredByUserId,
            timestamp: record.timestamp,
            source: record.source,
          }
        },
        { upsert: true }
      )
    );

    await Promise.all(updatePromises);

    console.log(`DEBUG QR: Successfully marked both pets as fed for ${mealTime} on ${dateString}`);

    return NextResponse.json({
      success: true,
      message: `Both pets marked as fed for ${mealTime}`,
      mealTime: mealTime,
      date: dateString,
      pets: ['dog', 'cat'],
      triggeredBy: triggeredBy,
      timestamp: timestamp.toISOString()
    });

  } catch (error) {
    console.error('Error processing QR code scan:', error);
    return NextResponse.json(
      { error: 'Failed to process QR code scan' },
      { status: 500 }
    );
  }
} 