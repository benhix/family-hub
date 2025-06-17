import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { 
  CalendarEventDocument, 
  documentToCalendarEvent, 
  CreateCalendarEventRequest 
} from '@/app/calendar/types/database';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'calendar';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CalendarEventDocument>(COLLECTION_NAME);
    
    const events = await collection
      .find({})
      .sort({ startDate: 1 })
      .toArray();
    
    const calendarEvents = events.map(documentToCalendarEvent);
    
    return NextResponse.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CalendarEventDocument>(COLLECTION_NAME);
    
    const body: CreateCalendarEventRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.startDate || !body.endDate || !body.addedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const eventDocument: Omit<CalendarEventDocument, '_id'> = {
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      location: body.location,
      addedBy: body.addedBy,
      addedByUserId: body.addedByUserId,
      customCreatorName: body.customCreatorName,
      useCustomCreator: body.useCustomCreator,
      attendees: body.attendees || [],
      category: body.category,
      allDay: body.allDay,
      color: body.color,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(eventDocument);
    
    if (result.insertedId) {
      const createdEvent = await collection.findOne({ _id: result.insertedId });
      if (createdEvent) {
        return NextResponse.json({
          success: true,
          data: documentToCalendarEvent(createdEvent)
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create calendar event' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
} 