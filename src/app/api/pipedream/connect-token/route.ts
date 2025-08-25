import { NextRequest, NextResponse } from 'next/server';
import { PipedreamClient } from '@pipedream/sdk';

export async function POST(request: NextRequest) {
  try {
    const { external_user_id } = await request.json();

    if (!external_user_id) {
      return NextResponse.json(
        { error: 'external_user_id is required' },
        { status: 400 }
      );
    }

    // Check if Pipedream credentials are configured
    const clientId = process.env.PIPEDREAM_CLIENT_ID;
    const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET;
    const projectId = process.env.PIPEDREAM_PROJECT_ID;
    const environment = process.env.PIPEDREAM_ENVIRONMENT || 'development';


    // Initialize Pipedream client
    const client = new PipedreamClient({
      projectEnvironment: environment as 'development' | 'production',
      clientId,
      clientSecret,
      projectId
    });

    console.log(`🔑 Generating connect token for user: ${external_user_id}`);

    // Generate connect token
    const tokenResponse = await client.tokens.create({
      externalUserId: external_user_id,
    });

    console.log(`✅ Connect token generated successfully for user: ${external_user_id}`);

    return NextResponse.json({
      token: tokenResponse.token,
      expiresAt: tokenResponse.expiresAt,
      connectLinkUrl: tokenResponse.connectLinkUrl
    });

  } catch (error) {
    console.error('❌ Error generating connect token:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate connect token' },
      { status: 500 }
    );
  }
}