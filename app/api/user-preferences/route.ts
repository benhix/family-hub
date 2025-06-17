import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const type = searchParams.get('type');
    
    const client = await clientPromise;
    const db = client.db();
    
    if (alertId) {
      // Handle alert dismissal check (legacy behavior)
      const preference = await db.collection('user_preferences').findOne({
        userId,
        alertId,
      });

      return NextResponse.json({
        dismissed: preference?.dismissed || false,
      });
    } else if (type === 'widgets') {
      // Handle widget preferences
      const preference = await db.collection('user_preferences').findOne({
        userId,
        type: 'widgets',
      });

      return NextResponse.json({
        widgetPreferences: preference?.widgetPreferences || null,
      });
    } else {
      // Return general user preferences
      const preference = await db.collection('user_preferences').findOne({
        userId,
        type: 'general',
      });

      if (preference) {
        return NextResponse.json({
          success: true,
          data: {
            useNickname: preference.useNickname ?? true,
            compactMode: preference.compactMode ?? false,
            showCompletedItems: preference.showCompletedItems ?? true,
            shoppingReminders: preference.shoppingReminders ?? true,
            calendarNotifications: preference.calendarNotifications ?? false,
            backgroundStyle: preference.backgroundStyle ?? 'default',
            lastTimeLogCleared: preference.lastTimeLogCleared,
            shoppingWidgetDate: preference.shoppingWidgetDate,
          }
        });
      } else {
        // Return default preferences for new users
        return NextResponse.json({
          success: true,
          data: {
            useNickname: true,
            compactMode: false,
            showCompletedItems: true,
            shoppingReminders: true,
            calendarNotifications: false,
            backgroundStyle: 'default',
          }
        });
      }
    }

  } catch (error) {
    console.error('Error fetching user preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    if (body.alertId && typeof body.dismissed === 'boolean') {
      // Handle alert dismissal (legacy behavior)
      const { alertId, dismissed } = body;
      
      await db.collection('user_preferences').updateOne(
        {
          userId,
          alertId,
        },
        {
          $set: {
            userId,
            alertId,
            dismissed,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true });
    } else if (body.type === 'widgets' && body.widgetPreferences) {
      // Handle widget preferences
      const { widgetPreferences } = body;
      
      await db.collection('user_preferences').updateOne(
        {
          userId,
          type: 'widgets',
        },
        {
          $set: {
            userId,
            type: 'widgets',
            widgetPreferences,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true });
    } else {
      // Handle general user preferences (useNickname, compactMode, etc.)
      const allowedFields = [
        'useNickname', 
        'compactMode', 
        'showCompletedItems', 
        'shoppingReminders', 
        'calendarNotifications', 
        'backgroundStyle',
        'lastTimeLogCleared',
        'shoppingWidgetDate'
      ];
      
      // Filter only allowed fields from the request body
      const updateData: any = {
        userId,
        type: 'general',
        updatedAt: new Date(),
      };
      
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field];
        }
      }
      
      // Update or create the general preferences document
      const result = await db.collection('user_preferences').updateOne(
        {
          userId,
          type: 'general',
        },
        {
          $set: updateData,
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Fetch the updated preferences to return
      const updatedPreference = await db.collection('user_preferences').findOne({
        userId,
        type: 'general',
      });

      return NextResponse.json({
        success: true,
        data: {
          useNickname: updatedPreference?.useNickname ?? true,
          compactMode: updatedPreference?.compactMode ?? false,
          showCompletedItems: updatedPreference?.showCompletedItems ?? true,
          shoppingReminders: updatedPreference?.shoppingReminders ?? true,
          calendarNotifications: updatedPreference?.calendarNotifications ?? false,
          backgroundStyle: updatedPreference?.backgroundStyle ?? 'default',
          lastTimeLogCleared: updatedPreference?.lastTimeLogCleared,
          shoppingWidgetDate: updatedPreference?.shoppingWidgetDate,
        }
      });
    }

  } catch (error) {
    console.error('Error saving user preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 