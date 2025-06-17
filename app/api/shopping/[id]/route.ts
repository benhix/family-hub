import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { 
  ShoppingItemDocument, 
  UpdateShoppingItemRequest,
  documentToShoppingItem 
} from '@/app/shopping/types/database';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'shopping-items';

// GET - Fetch single shopping item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<ShoppingItemDocument>(COLLECTION_NAME);

    const document = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const item = documentToShoppingItem(document);

    return NextResponse.json({
      success: true,
      data: item,
    });

  } catch (error) {
    console.error('Error fetching shopping item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shopping item' },
      { status: 500 }
    );
  }
}

// PATCH - Update shopping item (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateShoppingItemRequest = await request.json();

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (body.category && !['Grocery', 'F&V'].includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category. Must be "Grocery" or "F&V"' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<ShoppingItemDocument>(COLLECTION_NAME);

    // Build update object
    const updateDoc: Partial<ShoppingItemDocument> = {
      updatedAt: new Date(),
    };

    // Only include fields that are provided
    if (body.item !== undefined) updateDoc.item = body.item.trim();
    if (body.completed !== undefined) {
      updateDoc.completed = body.completed;
      // Set completedAt when marking as complete, clear it when unmarking
      updateDoc.completedAt = body.completed ? new Date() : undefined;
    }
    if (body.category !== undefined) updateDoc.category = body.category;
    if (body.priority !== undefined) updateDoc.priority = body.priority;
    if (body.quantity !== undefined) updateDoc.quantity = body.quantity;
    if (body.notes !== undefined) updateDoc.notes = body.notes.trim();

    // Update the document
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const updatedItem = documentToShoppingItem(result);

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });

  } catch (error) {
    console.error('Error updating shopping item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shopping item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete shopping item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<ShoppingItemDocument>(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting shopping item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shopping item' },
      { status: 500 }
    );
  }
} 