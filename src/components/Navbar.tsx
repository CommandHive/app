/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './Auth/AuthModal'

const navItems = [
    { href: "/", label: "New Project" },
    { href: "/myservers", label: "My Servers" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/showcase", label: "Showcase" },
]

const Navbar = () => {
    const pathname = usePathname()
    const { user, isAuthenticated, isLoading, logout } = useAuth()
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showAuthModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showAuthModal])

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
            <nav className="fixed flex justify-between items-center top-0 left-0 right-0 z-50 px-8 h-[72px] bg-white border-b border-gray-200">
                <div className="flex">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Command Hive Logo" width={28} height={28} priority />
                        <span className="text-[24px] font-bold text-[#14110E]">Command Hive</span>
                    </Link>
                </div>
                
                <div className="flex items-center gap-8">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {navItems.map((item) => (
                            <Link 
                                href={item.href}
                                key={item.href}
                                className={`text-[16px] rounded-lg px-4 py-2 transition-all duration-300 ease-in-out font-semibold text-gray-500 ${
                                    pathname === item.href ? "bg-slate-100 text-gray-800" : ""
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Desktop Auth Buttons */}
                    <div className="hidden items-center gap-4 md:flex">
                        {isAuthenticated && user ? (
                            <button
                                onClick={handleSignOut}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSignIn}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={handleSignIn}
                                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
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
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed top-[72px] left-0 right-0 z-40 border-b border-gray-200 bg-white md:hidden">
                    <div className="px-8 py-4">
                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => (
                                <Link
                                    href={item.href}
                                    key={item.href}
                                    onClick={closeMenus}
                                    className={`text-[16px] rounded-lg px-4 py-2 transition-all duration-300 ease-in-out font-semibold text-gray-500 ${
                                        pathname === item.href ? "bg-slate-100 text-gray-800" : ""
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="pt-2 flex flex-col gap-2">
                                {isAuthenticated && user ? (
                                    <button
                                        onClick={() => {
                                            handleSignOut()
                                            closeMenus()
                                        }}
                                        className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleSignIn()
                                                closeMenus()
                                            }}
                                            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleSignIn()
                                                closeMenus()
                                            }}
                                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 w-full"
                                        >
                                            Sign Up
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    )
}

export default Navbar