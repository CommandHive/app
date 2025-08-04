'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './Auth/AuthModal'

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  const handleSignOut = () => {
    logout()
  }

  return (
    <>
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
              {isAuthenticated && user && <span className="text-gray-700">
                    Welcome, {user.display_name || user.email}
                  </span>}
              <Link
                href="/leaderboard"
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                Leaderboard
              </Link>
              
              {isLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : isAuthenticated && user ? (
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
                    onClick={handleSignIn}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}