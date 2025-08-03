'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, ChatSession, ChatSessionsResponse } from '@/lib/api'
import { ClockIcon, ServerIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

export default function MyServersPage() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated && accessToken) {
      fetchSessions()
    }
  }, [accessToken, isAuthenticated, authLoading])

  const fetchSessions = async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching chat sessions...')
      
      const response: ChatSessionsResponse | null = await apiService.getChatSessions(accessToken)
      
      if (response && response.success) {
        console.log('Sessions fetched successfully:', response.sessions)
        setSessions(response.sessions)
      } else {
        setError('Failed to fetch sessions')
        console.error('Failed to fetch sessions:', response)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setError('Error fetching sessions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My MCP Servers</h1>
          <p className="text-gray-600">Manage and access your created MCP servers</p>
        </div>

        {/* Create New Server Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            + Create New Server
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your servers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchSessions}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded transition duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <ServerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No servers yet</h3>
                <p className="text-gray-600 mb-6">Create your first MCP server to get started</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Create Your First Server
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    {sessions.length} server{sessions.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <ServerIcon className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {session.title || `Server ${session.id.substring(0, 8)}`}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>Created: {formatDate(session.created_at)}</span>
                          </div>
                          {session.updated_at !== session.created_at && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>Updated: {formatDate(session.updated_at)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-400">
                          ID: {session.id}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </ProtectedRoute>
  )
}