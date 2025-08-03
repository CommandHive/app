'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
  sendMagicLink: (email: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  verifyMagicLink: (token: string) => Promise<{ success: boolean; error?: string }>
  loginWithOAuth: (provider: string, userData: any) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthResponse {
  success: boolean
  access_token: string
  user: User
  expires_in: number
}

const AUTH_TOKEN_KEY = 'access_token'
const AUTH_USER_KEY = 'auth_user'
const AUTH_EXPIRY_KEY = 'auth_expiry'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!accessToken

  const isTokenExpired = () => {
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY)
    if (!expiry) return true
    return Date.now() > parseInt(expiry)
  }

  const login = (token: string, userData: User) => {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
    localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString())
    
    setAccessToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(AUTH_EXPIRY_KEY)
    localStorage.removeItem('session_token') // Clean up old token
    localStorage.removeItem('jwt_token') // Clean up old token
    
    setAccessToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!accessToken) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
        }
      } else if (response.status === 401) {
        logout()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const sendMagicLink = async (email: string, displayName?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          display_name: displayName
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Failed to send magic link' }
      }
    } catch (error) {
      console.error('Magic link error:', error)
      return { success: false, error: 'Network error during magic link request' }
    }
  }

  const verifyMagicLink = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        login(data.access_token, data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Magic link verification failed' }
      }
    } catch (error) {
      console.error('Magic link verification error:', error)
      return { success: false, error: 'Network error during verification' }
    }
  }

  const loginWithOAuth = async (provider: string, userData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/auth/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          user: userData
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        login(data.access_token, data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'OAuth login failed' }
      }
    } catch (error) {
      console.error('OAuth login error:', error)
      return { success: false, error: 'Network error during OAuth login' }
    }
  }

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const storedUser = localStorage.getItem(AUTH_USER_KEY)
      
      if (storedToken && storedUser && !isTokenExpired()) {
        try {
          const userData = JSON.parse(storedUser)
          setAccessToken(storedToken)
          setUser(userData)
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          logout()
        }
      } else if (storedToken && isTokenExpired()) {
        logout()
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    sendMagicLink,
    verifyMagicLink,
    loginWithOAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}