/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'

interface MagicLinkFormProps {
  onSwitchToOAuth?: () => void
}

export default function MagicLinkForm({ onSwitchToOAuth }: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendMagicLink, loginWithOAuth } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const result = await sendMagicLink(email, displayName || undefined)
      if (result.success) {
        setSuccess('Magic link sent! Check your email and click the link to sign in.')
        setEmail('')
        setDisplayName('')
      } else {
        setError(result.error || 'Failed to send magic link')
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

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google OAuth
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          use_fedcm_for_prompt: false,
          callback: async (response: any) => {
            try {
              // Decode the Google JWT token
              const payload = JSON.parse(atob(response.credential.split('.')[1]))
              
              const result = await loginWithOAuth('google', {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture
              })
              
              if (!result.success) {
                setError(result.error || 'Google login failed')
              }
            } catch (error) {
              console.error('Google login error:', error)
              setError('Google login failed')
            }
          }
        })

        window.google.accounts.id.prompt()
      } else {
        setError('Google Sign-In not available')
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('Google login failed')
    }
  }

  return (
    <main className="w-full">
      <div className=" flex items-center justify-center">
        <div className="w-full max-w-[390px] p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <Image src="/logo.svg" alt="Command Hive" width={24} height={24} />
            </div>
            <h1 className="text-[28px] font-semibold text-[#14110E]">Sign In</h1>
            <p className="mt-2 text-sm text-[#667085]">
              Sign in to your account to continue with CommandHive
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-md border border-gray-300 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Sign In Link'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="h-12 w-full rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-800">Continue With Google</span>
            </button>
            <button
              onClick={handleGithubLogin}
              className="h-12 w-full rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium text-gray-800">Continue With Github</span>
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-slate-900 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}