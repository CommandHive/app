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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⬢</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Command Hive</h1>
              </Link>
              <Link href="/showcase" className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium">
                Showcase
              </Link>
            </div>
            
            {/* Navigation Items */}
            <div className="flex items-center space-x-8">
              

              <Link href="/my-servers" className="text-gray-600 hover:text-gray-900 font-medium">
                My Servers
              </Link>
          
              {/* User Avatar */}
              {isAuthenticated && user ? (

                <button
                  onClick={handleSignOut}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Logout
                </button>

                
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Sign In
                </button>
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