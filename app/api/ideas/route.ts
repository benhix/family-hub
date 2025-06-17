import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { description, submittedBy, submittedByUserId, userAgent, url } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('ideas');

    const idea = {
      description: description.trim(),
      submittedBy: submittedBy || 'Anonymous',
      submittedByUserId: submittedByUserId || null,
      userAgent: userAgent || null,
      url: url || null,
      status: 'new', // new, under-review, approved, implemented, rejected
      category: 'general', // feature, improvement, design, workflow, general
      votes: 0, // Future feature for voting on ideas
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(idea);

    return NextResponse.json({
      id: result.insertedId,
      message: 'Idea submitted successfully',
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to submit idea' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('ideas');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const ideas = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB ObjectIds to strings
    const formattedIdeas = ideas.map(idea => ({
      ...idea,
      id: idea._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ ideas: formattedIdeas });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
} 