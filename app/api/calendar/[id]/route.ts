import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { 
  CalendarEventDocument, 
  documentToCalendarEvent, 
  UpdateCalendarEventRequest 
} from '@/app/calendar/types/database';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'calendar';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CalendarEventDocument>(COLLECTION_NAME);
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await collection.findOne({ _id: new ObjectId(params.id) });
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: documentToCalendarEvent(event)
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar event' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CalendarEventDocument>(COLLECTION_NAME);
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body: UpdateCalendarEventRequest = await request.json();
    
    const updateFields: Partial<CalendarEventDocument> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateFields.title = body.title;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.startDate !== undefined) updateFields.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateFields.endDate = new Date(body.endDate);
    if (body.location !== undefined) updateFields.location = body.location;
    if (body.customCreatorName !== undefined) updateFields.customCreatorName = body.customCreatorName;
    if (body.useCustomCreator !== undefined) updateFields.useCustomCreator = body.useCustomCreator;
    if (body.attendees !== undefined) updateFields.attendees = body.attendees;
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.allDay !== undefined) updateFields.allDay = body.allDay;
    if (body.color !== undefined) updateFields.color = body.color;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: documentToCalendarEvent(result)
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CalendarEventDocument>(COLLECTION_NAME);
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
} 