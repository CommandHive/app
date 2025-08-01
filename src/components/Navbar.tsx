'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiService, User } from '@/lib/api'
import '@/types/auth'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [backendUser, setBackendUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('Navbar useEffect - session:', session)
    console.log('Navbar useEffect - accessToken:', session?.accessToken)
    
    if (session?.accessToken) {
      setLoading(true)
      console.log('Fetching backend user with token:', session.accessToken.substring(0, 20) + '...')
      
      apiService.getCurrentUser(session.accessToken as string)
        .then(user => {
          console.log('Backend user fetched:', user)
          setBackendUser(user)
          if (user) {
            localStorage.setItem('jwt_token', session.accessToken as string)
            console.log('JWT token stored in localStorage')
          }
        })
        .catch(error => console.error('Failed to fetch backend user:', error))
        .finally(() => setLoading(false))
    } else {
      console.log('No access token in session')
      setBackendUser(null)
      localStorage.removeItem('jwt_token')
    }
  }, [session])

  const handleSignOut = async () => {
    localStorage.removeItem('jwt_token')
    setBackendUser(null)
    await signOut()
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-gray-800 hover:text-gray-600 cursor-pointer">CommandHive</h1>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/leaderboard"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Leaderboard
            </Link>
            {status === 'loading' || loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/my-servers"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  My Servers
                </Link>
                <Link
                  href="/my-earnings"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  My Earnings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => signIn('google')}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={() => signIn('github')}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Sign in with GitHub
                </button>
                <button
                  onClick={() => window.location.href = '/api/auth/signin'}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Sign in with Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}