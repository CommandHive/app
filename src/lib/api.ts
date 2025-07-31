const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

export interface User {
  email: string
  display_name: string
  username?: string
  avatar_url?: string
  subscription_tier: string
  is_active: boolean
  wallet_address?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  async createSession(userData: {
    email: string
    name?: string
    provider: string
    provider_id: string
    username?: string
    image?: string
  }): Promise<{ access_token: string; user: User } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      return data.success ? { access_token: data.access_token, user: data.user } : null
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  }

  async getAuthStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to get auth status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting auth status:', error)
      return null
    }
  }
}

export const apiService = new ApiService()