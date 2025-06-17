import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { 
  ShoppingItemDocument, 
  CreateShoppingItemRequest,
  documentToShoppingItem 
} from '@/app/shopping/types/database';

const DB_NAME = 'hicks-hub';
const COLLECTION_NAME = 'shopping-items';

// GET - Fetch all shopping items
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<ShoppingItemDocument>(COLLECTION_NAME);

    // Fetch all items sorted by createdAt (newest first)
    const documents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB documents to frontend format
    const items = documents.map(documentToShoppingItem);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch shopping items' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new shopping item
export async function POST(request: NextRequest) {
  try {
    const body: CreateShoppingItemRequest = await request.json();
    
    // Validation
    if (!body.item || !body.category || !body.addedBy || !body.addedByUserId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: item, category, addedBy, and addedByUserId are required' 
        },
        { status: 400 }
      );
    }

    if (!['Grocery', 'F&V'].includes(body.category)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category. Must be "Grocery" or "F&V"' 
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<ShoppingItemDocument>(COLLECTION_NAME);

    // Create new document
    const newDocument: ShoppingItemDocument = {
      item: body.item.trim(),
      completed: false,
      addedBy: body.addedBy.trim(), // Keep for legacy compatibility
      addedByUserId: body.addedByUserId.trim(), // Store user ID for dynamic resolution
      category: body.category,
      createdAt: new Date(),
      priority: body.priority || 'medium',
      quantity: body.quantity || 1,
      notes: body.notes?.trim() || '',
    };

    // Insert into database
    const result = await collection.insertOne(newDocument);
    
    // Fetch the created document to return with proper formatting
    const createdDocument = await collection.findOne({ _id: result.insertedId });
    
    if (!createdDocument) {
      throw new Error('Failed to retrieve created item');
    }

    const createdItem = documentToShoppingItem(createdDocument);

    return NextResponse.json({
      success: true,
      data: createdItem,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating shopping item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create shopping item' 
      },
      { status: 500 }
    );
  }
} 