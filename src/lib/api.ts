// Real API integration with backend

export interface User {
  email?: string
  display_name: string
  username?: string
  avatar_url?: string
  subscription_tier: string
  is_active: boolean
  wallet_address?: string
  github_id?: string
  google_id?: string
  created_at?: string
  updated_at?: string
  nonce?: string
  nonce_expires_at?: string
}

// Get API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatSessionsResponse {
  success: boolean
  sessions: ChatSession[]
  total: number
}

class ApiService {
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('session_token') || localStorage.getItem('jwt_token')
    }
    return null
  }

  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Use provided token, or fall back to localStorage token
    const authToken = token || this.getStoredToken()
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }
    
    return headers
  }

  private async handleTokenRefresh(response: Response, originalToken: string): Promise<string | null> {
    if (response.status === 401) {
      console.log('API token expired - clearing auth')
      
      // Clear all auth data on token expiration
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_expiry')
        localStorage.removeItem('session_token')
        localStorage.removeItem('jwt_token')
        
        // Trigger auth context logout if available
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      return null
    }
    return originalToken
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit, token: string): Promise<Response> {
    const response = await fetch(url, options)
    
    if (response.status === 401) {
      await this.handleTokenRefresh(response, token)
      throw new Error('Authentication failed - token expired')
    }
    
    return response
  }

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      console.log('API getCurrentUser - calling backend')
      
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      }, token)

      const data = await response.json()
      return data.success && data.user ? data.user : null
    } catch (error) {
      console.error('API getCurrentUser - error:', error)
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
      console.log('API createSession - calling backend')
      
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        console.error('API createSession - failed:', response.status)
        return null
      }

      const data = await response.json()
      return data.success ? { access_token: data.access_token, user: data.user } : null
    } catch (error) {
      console.error('API createSession - error:', error)
      return null
    }
  }

  async getAuthStatus(): Promise<any> {
    try {
      console.log('API getAuthStatus - calling backend')
      
      const response = await fetch(`${API_BASE_URL}/auth/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        console.error('API getAuthStatus - failed:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API getAuthStatus - error:', error)
      return null
    }
  }

  async createChat(prompt: string, token: string, chatSessionId?: string): Promise<{ chat_id: string; data?: any } | null> {
    try {
      console.log('API createChat - calling backend')
      
      const payload: any = {
        prompt
      }

      if (chatSessionId) {
        payload.chat_session_id = chatSessionId
      }

      const response = await fetch(`${API_BASE_URL}/chat/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('API createChat - failed:', response.status)
        return null
      }

      const data = await response.json()
      return data.success ? { chat_id: data.chat_session_id, data: data } : null
    } catch (error) {
      console.error('API createChat - error:', error)
      return null
    }
  }

  async sendMessage(chatId: string, message: string, token: string): Promise<any> {
    try {
      console.log('API sendMessage - calling backend')
      
      const payload = {
        chat_id: chatId,
        message: message
      }

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('API sendMessage - failed:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API sendMessage - error:', error)
      return null
    }
  }

  async getChatHistory(chatId: string, token: string): Promise<any> {
    try {
      console.log('API getChatHistory - calling backend')

      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        console.error('API getChatHistory - failed:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API getChatHistory - error:', error)
      return null
    }
  }

  async getChatStatus(chatId: string, token: string): Promise<any> {
    try {
      console.log('API getChatStatus - calling backend')

      const response = await fetch(`${API_BASE_URL}/chat/${chatId}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        console.error('API getChatStatus - failed:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API getChatStatus - error:', error)
      return null
    }
  }

  async getChatSessions(token: string): Promise<ChatSessionsResponse | null> {
    try {
      console.log('API getChatSessions - calling backend')

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      })

      if (!response.ok) {
        console.error('API getChatSessions - failed:', response.status)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API getChatSessions - error:', error)
      return null
    }
  }

  // Helper method to get current token from localStorage
  getAuthToken(): string | null {
    return this.getStoredToken()
  }

  // Helper method to clear stored token
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_expiry')
      localStorage.removeItem('session_token')
      localStorage.removeItem('jwt_token')
    }
  }
}

export const apiService = new ApiService()