'use client'

import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ChatWindow from '@/components/ChatWindow'
import TabbedInterface from '@/components/TabbedInterface'

export default function ChatPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const chatId = params.id as string

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating your MCP server...</h2>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Chat Window - 30% of screen */}
          <div className="w-[30%] border-r border-gray-300 bg-white">
            <ChatWindow chatId={chatId} />
          </div>
          
          {/* Tabbed Interface - 70% of screen */}
          <div className="w-[70%] bg-white">
            <TabbedInterface chatId={chatId} />
          </div>
        </div>
      )}
    </div>
  )
}