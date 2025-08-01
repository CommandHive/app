'use client'

import { useState } from 'react'
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Tab {
  id: string
  name: string
  content: React.ReactNode
}

interface TabbedInterfaceProps {
  chatId: string
  chatData?: any
}

export default function TabbedInterface({ chatId, chatData }: TabbedInterfaceProps) {
  const [activeTab, setActiveTab] = useState('code')
  const [copied, setCopied] = useState(false)

  // Extract code from chatData
  const extractCodeFromResponse = (data: any): string => {
    if (!data) return 'No code available yet...'
    
    try {
      if (data.code) {
        // The code field contains a JSON string with nested code
        if (data.code.startsWith('```json')) {
          // Extract code from JSON block
          const jsonMatch = data.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || 'No code found in JSON';
          }
        }
        // If it's already plain text code
        return data.code;
      }
      return 'No code found in response'
    } catch (error) {
      console.error('Error extracting code:', error)
      return data.code || 'Error extracting code from response'
    }
  }

  const copyToClipboard = async () => {
    const code = extractCodeFromResponse(chatData)
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const tabs: Tab[] = [
    {
      id: 'code',
      name: 'Generated Code',
      content: (
        <div className="p-6 h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">MCP Server Code</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-[calc(100%-5rem)] overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {extractCodeFromResponse(chatData)}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'info',
      name: 'Info',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Information</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Chat Session ID: {chatId}</p>
              <p className="text-xs text-gray-400 mt-1">This ID will be used as chat_id in API calls</p>
            </div>
            {chatData && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Status: {chatData.is_deployable ? 'Deployable' : 'In Progress'}</p>
                {chatData.usage && (
                  <p className="text-xs text-blue-500 mt-1">
                    Tokens used: {chatData.usage.total_tokens} ({chatData.usage.prompt_tokens} prompt + {chatData.usage.completion_tokens} completion)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'tab2',
      name: 'Tab 2',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tab 2 Content</h3>
          <p className="text-gray-600">This is the content for Tab 2. Future features will be implemented here.</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Ready for implementation</p>
          </div>
        </div>
      )
    },
    {
      id: 'tab3',
      name: 'Tab 3',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tab 3 Content</h3>
          <p className="text-gray-600">This is the content for Tab 3. Future features will be implemented here.</p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Coming soon</p>
          </div>
        </div>
      )
    },
    {
      id: 'tab4',
      name: 'Tab 4',
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tab 4 Content</h3>
          <p className="text-gray-600">This is the content for Tab 4. Future features will be implemented here.</p>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">Placeholder content</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}