'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './Auth/AuthModal'

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  const handleSignOut = () => {
    logout()
  }

  const closeMenus = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-inset ring-gray-300">
                  <span className="h-2 w-2 rounded-full bg-gray-800" />
                </span>
                <span className="text-base font-semibold tracking-tight text-gray-900">Command Hive</span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden items-center gap-6 md:flex">
                <Link
                  href="/showcase"
                  className="text-sm text-gray-700 transition-colors hover:text-gray-900"
                >
                  Showcase
                </Link>
                <Link
                  href="/my-servers"
                  className="text-sm text-gray-700 transition-colors hover:text-gray-900"
                >
                  My Servers
                </Link>
              </div>
            </div>

            {/* Right: Auth + Mobile toggle */}
            <div className="flex items-center gap-3">
              {/* Auth button (desktop) */}
              <div className="hidden md:block">
                {isAuthenticated && user ? (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm/25 transition-colors hover:bg-gray-50"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm/25 transition-colors hover:bg-gray-50"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 md:hidden bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3">
                <Link
                  href="/showcase"
                  onClick={closeMenus}
                  className="text-sm text-gray-800"
                >
                  Showcase
                </Link>
                <Link
                  href="/my-servers"
                  onClick={closeMenus}
                  className="text-sm text-gray-800"
                >
                  My Servers
                </Link>

                <div className="pt-2">
                  {isAuthenticated && user ? (
                    <button
                      onClick={() => {
                        handleSignOut()
                        closeMenus()
                      }}
                      className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleSignIn()
                        closeMenus()
                      }}
                      className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}