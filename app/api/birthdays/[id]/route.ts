import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'birthdays';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid birthday ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, birthDate, originalYear, notes, reminderDays } = body;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if birthday exists
    const existingBirthday = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingBirthday) {
      return NextResponse.json({ 
        success: false, 
        error: 'Birthday not found' 
      }, { status: 404 });
    }

    // If name is being updated, check for duplicates
    if (name && name !== existingBirthday.name) {
      const duplicateBirthday = await collection.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: new ObjectId(id) }
      });

      if (duplicateBirthday) {
        return NextResponse.json({ 
          success: false, 
          error: `A birthday for "${name}" already exists` 
        }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);
    if (originalYear !== undefined) updateData.originalYear = originalYear || undefined;
    if (notes !== undefined) updateData.notes = notes?.trim() || undefined;
    if (reminderDays !== undefined) updateData.reminderDays = reminderDays;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Birthday not found' 
      }, { status: 404 });
    }

    // Get the updated birthday
    const updatedBirthday = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!updatedBirthday) {
      return NextResponse.json({ 
        success: false, 
        error: 'Birthday not found after update' 
      }, { status: 500 });
    }

    const formattedBirthday = {
      id: updatedBirthday._id.toString(),
      name: updatedBirthday.name,
      birthDate: updatedBirthday.birthDate,
      originalYear: updatedBirthday.originalYear,
      notes: updatedBirthday.notes,
      reminderDays: updatedBirthday.reminderDays,
      addedBy: updatedBirthday.addedBy,
      addedByUserId: updatedBirthday.addedByUserId,
      createdAt: updatedBirthday.createdAt,
      updatedAt: updatedBirthday.updatedAt,
    };

    return NextResponse.json({ 
      success: true, 
      data: formattedBirthday 
    });
  } catch (error) {
    console.error('Error updating birthday:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid birthday ID' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Birthday not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Birthday deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting birthday:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 