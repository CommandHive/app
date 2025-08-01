'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  chatId: string
  initialPrompt?: string
  isCreatingChat?: boolean
  chatData?: any
}

export default function ChatWindow({ chatId, initialPrompt, isCreatingChat, chatData }: ChatWindowProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialMessages: ChatMessage[] = []
    
    if (initialPrompt) {
      initialMessages.push({
        id: '1',
        type: 'user',
        content: initialPrompt,
        timestamp: new Date()
      })
    }
    
    if (!isCreatingChat) {
      initialMessages.push({
        id: '2',
        type: 'assistant',
        content: 'Hello! I\'ve started working on your MCP server. What would you like to know or modify?',
        timestamp: new Date()
      })
    }
    
    return initialMessages
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add assistant message when chat creation is complete
    if (!isCreatingChat && initialPrompt && messages.length === 1 && messages[0].type === 'user' && chatData) {
      setTimeout(() => {
        const responseContent = chatData.next_steps || 'Hello! I\'ve created your MCP server. What would you like to know or modify?'
        const assistantMessage: ChatMessage = {
          id: '2',
          type: 'assistant',
          content: responseContent,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 500) // Small delay for better UX
    }
  }, [isCreatingChat, initialPrompt, messages.length, chatData])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session?.accessToken || !chatId || chatId === 'creating') return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      console.log('Sending message to chat_session_id:', chatId)
      const response = await apiService.sendMessage(chatId, inputMessage, session.accessToken as string)
      
      if (response && response.message) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Fallback response if API doesn't return a message
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I understand your request. Let me work on that for you...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        <p className="text-sm text-gray-500">Chat ID: {chatId}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {(isTyping || isCreatingChat) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              {isCreatingChat && (
                <p className="text-xs text-gray-500 mt-1">Creating your MCP server...</p>
              )}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`px-4 py-2 rounded-lg transition-colors ${
              inputMessage.trim() && !isTyping
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}