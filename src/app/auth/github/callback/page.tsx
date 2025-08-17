'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function GitHubCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('Connecting to GitHub...')
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false)
  const hasProcessed = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) return
      hasProcessed.current = true

      try {
        setProgress(10)
        setLoadingMessage('Validating authorization...')

        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
          setError('No authorization code received from GitHub')
          setStatus('error')
          return
        }

        sessionStorage.removeItem('github_oauth_state')

        setProgress(50)
        setLoadingMessage('Exchanging authorization code...')

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/auth/oauth/github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            state: state
          }),
        })

        if (!response.ok) {
          setError(`GitHub OAuth error: Failed to authenticate (${response.status})`)
          setStatus('error')
          return
        }

        setProgress(75)
        setLoadingMessage('Retrieving user information...')

        const result = await response.json()

        if (result.success) {
          setIsProcessingSuccess(true)
          setProgress(90)
          setLoadingMessage('Completing sign-in...')

          login(result.access_token, result.user)

          setProgress(100)
          setLoadingMessage('Success! Redirecting...')
          setStatus('success')

          setTimeout(() => {
            router.push('/')
          }, 1000)
        } else {
          if (!isProcessingSuccess) {
            setError(result.error || 'GitHub login failed')
            setStatus('error')
          }
        }

      } catch (error) {
        console.error('GitHub OAuth error:', error)
        if (!isProcessingSuccess) {
          setError('Failed to complete GitHub authentication')
          setStatus('error')
        }
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Signing in with GitHub
                </h2>
                <p className="text-gray-600 mb-6">{loadingMessage}</p>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{progress}% complete</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900">
                GitHub sign-in successful!
              </h2>
              <p className="text-green-700 mt-2">Redirecting you to the application...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900">
                GitHub sign-in failed
              </h2>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => router.push('/auth')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <GitHubCallbackContent />
    </Suspense>
  )
}