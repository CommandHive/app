/**
 * Google Auth Debug Utility
 * Helps debug Google OAuth configuration issues
 */

export interface GoogleAuthDebugInfo {
  clientIdConfigured: boolean;
  clientIdValue: string | undefined;
  scriptLoaded: boolean;
  apiAvailable: boolean;
  currentOrigin: string;
  recommendedOrigins: string[];
  issues: string[];
  solutions: string[];
}

export function debugGoogleAuth(): GoogleAuthDebugInfo {
  const info: GoogleAuthDebugInfo = {
    clientIdConfigured: false,
    clientIdValue: undefined,
    scriptLoaded: false,
    apiAvailable: false,
    currentOrigin: '',
    recommendedOrigins: [],
    issues: [],
    solutions: []
  };

  // Check client ID configuration
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  info.clientIdConfigured = !!clientId;
  info.clientIdValue = clientId;

  if (!clientId) {
    info.issues.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable not set');
    info.solutions.push('Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env file');
  }

  // Check current origin and script availability
  if (typeof window !== 'undefined') {
    info.currentOrigin = window.location.origin;
    info.recommendedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'https://your-production-domain.com'
    ];

    // Check if Google Sign-In script is loaded
    const scriptExists = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    info.scriptLoaded = !!scriptExists;

    if (!scriptExists) {
      info.issues.push('Google Sign-In script not loaded');
      info.solutions.push('Add <script src="https://accounts.google.com/gsi/client" async defer></script> to your HTML head');
    }

    // Check if Google API is available
    info.apiAvailable = !!(window as any).google?.accounts?.id;

    if (!info.apiAvailable && info.scriptLoaded) {
      info.issues.push('Google Sign-In API not available (script loaded but API not ready)');
      info.solutions.push('Wait for the script to fully load or check for network issues');
    }
  }

  // Generate specific issues and solutions
  if (info.clientIdConfigured && info.scriptLoaded && info.apiAvailable) {
    if (info.issues.length === 0) {
      info.solutions.push('Configuration appears correct. If you\'re still getting origin errors, check Google Cloud Console.');
    }
  }

  return info;
}

export function logGoogleAuthDebug(): void {
  const debug = debugGoogleAuth();
  
  console.group('🔍 Google OAuth Debug Information');
  console.log('Client ID Configured:', debug.clientIdConfigured);
  console.log('Client ID Value:', debug.clientIdValue || 'Not set');
  console.log('Script Loaded:', debug.scriptLoaded);
  console.log('API Available:', debug.apiAvailable);
  console.log('Current Origin:', debug.currentOrigin || 'Unknown (server-side)');
  
  if (debug.issues.length > 0) {
    console.group('❌ Issues Found');
    debug.issues.forEach(issue => console.log('• ' + issue));
    console.groupEnd();
  }
  
  if (debug.solutions.length > 0) {
    console.group('💡 Recommended Solutions');
    debug.solutions.forEach(solution => console.log('• ' + solution));
    console.groupEnd();
  }
  
  console.group('🌐 Recommended Authorized Origins for Google Cloud Console');
  debug.recommendedOrigins.forEach(origin => console.log('• ' + origin));
  console.groupEnd();
  
  console.groupEnd();
}

export function getGoogleCloudConsoleInstructions(): string {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  return `
📋 Google Cloud Console Setup Instructions:

1. Go to https://console.cloud.google.com/
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID or create a new one
5. Under "Authorized JavaScript origins", add these URLs:
   • ${currentOrigin}
   • http://localhost:3000
   • https://localhost:3000
   • http://127.0.0.1:3000
   
6. Under "Authorized redirect URIs" (if needed), add:
   • ${currentOrigin}/auth/callback
   
7. Save the configuration
8. Wait a few minutes for changes to propagate

⚠️  Common Issues:
• Make sure the Client ID in your .env matches the one in Google Cloud Console
• Ensure all development and production URLs are added to authorized origins
• Check that the Google Cloud project has the Google Sign-In API enabled
`;
}