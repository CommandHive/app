'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'
import { apiService } from '@/lib/api'

export default function NewChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isCreatingChat, setIsCreatingChat] = useState(true)
  const [chatId, setChatId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatData, setChatData] = useState<any>(null)
  
  const prompt = searchParams.get('prompt') || ''

  useEffect(() => {
    if (!session?.accessToken || !prompt) return

    const createChat = async () => {
      try {
        console.log('Creating chat with prompt:', prompt)
        const result = await apiService.createChat(
          prompt, 
          session.accessToken as string, 
          session.user?.email || undefined
        )
        
        if (result?.chat_id) {
          console.log('Chat created successfully with chat_session_id:', result.chat_id)
          console.log('Chat response data:', result.data)
          setChatId(result.chat_id)
          setChatData(result.data)
          // Update URL to the actual chat ID without redirect
          window.history.replaceState({}, '', `/chat/${result.chat_id}`)
        } else {
          setError('Failed to create chat')
        }
      } catch (error) {
        console.error('Error creating chat:', error)
        setError('Failed to create chat')
      } finally {
        setIsCreatingChat(false)
      }
    }

    createChat()
  }, [session, prompt])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access this chat.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Chat Window - 30% of screen */}
        <div className="w-[30%] border-r border-gray-300 bg-white">
          <ChatWindow 
            chatId={chatId || 'creating'} 
            initialPrompt={prompt}
            isCreatingChat={isCreatingChat}
            chatData={chatData}
          />
        </div>
        
        {/* Tabbed Interface - 70% of screen */}
        <div className="w-[70%] bg-white">
          {isCreatingChat ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating your MCP server...</h2>
                <p className="text-gray-600">This may take a few moments</p>
              </div>
            </div>
          ) : (
            <TabbedInterface chatId={chatId || ''} chatData={chatData} />
          )}
        </div>
      </div>
    </div>
  )
}