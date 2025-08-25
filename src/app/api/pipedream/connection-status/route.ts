import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { app, external_user_id } = await request.json();

    if (!app || !external_user_id) {
      return NextResponse.json(
        { error: 'app and external_user_id are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking connection status for app: ${app}, user: ${external_user_id}`);

    // In a real implementation, you would check the actual connection status
    // For demo purposes, we'll return a mock response
    
    // Simulate some connected apps
    const connectedApps = ['google_sheets', 'gmail', 'notion'];
    const connected = connectedApps.includes(app);

    console.log(`📊 Connection status for ${app}: ${connected ? 'Connected' : 'Disconnected'}`);

    return NextResponse.json({
      connected,
      app,
      external_user_id,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error checking connection status:', error);
    
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}