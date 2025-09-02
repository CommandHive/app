'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logGoogleAuthDebug } from '@/lib/googleAuthDebug'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginWithCredentials, loginWithOAuth } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await loginWithCredentials(email, password)
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_ID || 'a5ce13d3c38e31715e96'
    const redirectUri = `${window.location.origin}/auth/github/callback`
    const scope = 'user:email'
    const state = Math.random().toString(36).substring(2, 15)
    
    // Store state for verification
    sessionStorage.setItem('github_oauth_state', state)
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
    
    window.location.href = githubAuthUrl
  }

  const initializeGoogleSignIn = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.warn('Google OAuth client ID not configured');
        return false;
      }

      // Check if Google Sign-In script is loaded
      if (typeof window === 'undefined' || !window.google?.accounts?.id) {
        return false;
      }

      // Initialize Google OAuth with improved configuration
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response.credential) {
              setError('No credential received from Google');
              return;
            }

            // Decode the Google JWT token with better error handling
            const tokenParts = response.credential.split('.');
            if (tokenParts.length !== 3) {
              setError('Invalid Google credential format');
              return;
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            
            if (!payload.email || !payload.sub) {
              setError('Incomplete user data from Google');
              return;
            }

            const result = await loginWithOAuth('google', {
              id: payload.sub,
              email: payload.email,
              name: payload.name || payload.email,
              picture: payload.picture
            });
            
            if (!result.success) {
              setError(result.error || 'Google login failed');
            }
          } catch (error) {
            console.error('Google callback error:', error);
            setError('Failed to process Google login. Please try again.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Try to render the button
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            shape: 'rectangular',
            theme: 'outline',
            text: 'continue_with',
            size: 'large',
            width: buttonContainer.offsetWidth
          });
          
          // Hide the fallback button if Google button renders successfully
          const fallbackButton = document.getElementById('google-fallback-button');
          if (fallbackButton) {
            fallbackButton.style.display = 'none';
          }
          
          return true;
        } catch (error) {
          console.error('Error rendering Google button:', error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    // For fallback button - try to prompt sign-in
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Error prompting Google sign-in:', error);
        setError('Google Sign-In is not available. Please try refreshing the page.');
      }
    } else {
      setError('Google Sign-In script not loaded. Please refresh and try again.');
    }
  };

  // Initialize Google Sign-In on component mount
  useEffect(() => {
    // Wait for Google script to load and initialize
    const tryInitialize = async () => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total

      const checkAndInit = async () => {
        if (attempts >= maxAttempts) {
          console.warn('Google Sign-In script failed to load after 5 seconds');
          return;
        }

        const success = await initializeGoogleSignIn();
        if (!success) {
          attempts++;
          setTimeout(checkAndInit, 100);
        }
      };

      if (typeof window !== 'undefined') {
        checkAndInit();
      }
    };

    tryInitialize();
    
    // Debug Google Auth configuration
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => logGoogleAuthDebug(), 1000);
    }
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {/* Google Sign-In Button Container */}
          <div id="google-signin-button" className="w-full"></div>
          
          {/* Fallback custom button if Google button doesn't render */}
          <button
            id="google-fallback-button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGithubLogin}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}