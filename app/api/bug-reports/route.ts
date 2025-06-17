import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { description, reportedBy, reportedByUserId, userAgent, url } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('bug_reports');

    const bugReport = {
      description: description.trim(),
      reportedBy: reportedBy || 'Anonymous',
      reportedByUserId: reportedByUserId || null,
      userAgent: userAgent || null,
      url: url || null,
      status: 'open', // open, in-progress, resolved, closed
      priority: 'medium', // low, medium, high, critical
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(bugReport);

    return NextResponse.json({
      id: result.insertedId,
      message: 'Bug report submitted successfully',
    });
  } catch (error) {
    console.error('Error creating bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('bug_reports');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const bugReports = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB ObjectIds to strings
    const formattedReports = bugReports.map(report => ({
      ...report,
      id: report._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ bugReports: formattedReports });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    );
  }
} 