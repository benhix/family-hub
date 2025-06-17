import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check if MONGODB_URI is set
    const hasMongoUri = !!process.env.MONGODB_URI;
    const mongoUriPrefix = process.env.MONGODB_URI?.substring(0, 20) + '...';
    
    // Try to connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Test the connection
    await db.admin().ping();
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      hasMongoUri,
      mongoUriPrefix,
      timestamp: new Date().toISOString(),
      message: 'MongoDB connection successful'
    });
    
  } catch (error) {
    console.error('Debug route error:', error);
    
    return NextResponse.json({
      success: false,
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) + '...',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 