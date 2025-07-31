'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const examplePrompts = [
  {
    id: 1,
    title: "Web Scraping Server",
    description: "Create an MCP server that can scrape websites and extract structured data",
    prompt: "Create a web scraping MCP server that can extract product information from e-commerce sites",
    category: "Data Extraction"
  },
  {
    id: 2,
    title: "Database Query Server",
    description: "Build an MCP server for executing SQL queries and database operations",
    prompt: "Build an MCP server that connects to PostgreSQL and executes safe SQL queries",
    category: "Database"
  },
  {
    id: 3,
    title: "File Management Server",
    description: "Create an MCP server for file operations like reading, writing, and organizing files",
    prompt: "Create a file management MCP server that can organize files by type and date",
    category: "File System"
  },
  {
    id: 4,
    title: "API Integration Server",
    description: "Build an MCP server that integrates with external APIs and services",
    prompt: "Build an MCP server that integrates with GitHub API for repository management",
    category: "API Integration"
  },
  {
    id: 5,
    title: "Email Processing Server",
    description: "Create an MCP server for sending, receiving, and processing emails",
    prompt: "Create an email processing MCP server that can send notifications and parse attachments",
    category: "Communication"
  },
  {
    id: 6,
    title: "Image Processing Server",
    description: "Build an MCP server for image manipulation and analysis",
    prompt: "Build an image processing MCP server that can resize, compress, and analyze images",
    category: "Media Processing"
  },
  {
    id: 7,
    title: "Cloud Storage Server",
    description: "Create an MCP server for cloud storage operations (AWS S3, Google Cloud)",
    prompt: "Create a cloud storage MCP server that uploads files to AWS S3 with automatic backups",
    category: "Cloud Services"
  },
  {
    id: 8,
    title: "Monitoring Server",
    description: "Build an MCP server for system monitoring and alerting",
    prompt: "Build a monitoring MCP server that tracks server health and sends alerts",
    category: "DevOps"
  }
]

export default function Homepage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExample, setSelectedExample] = useState<number | null>(null)

  const handleSearch = () => {
    if (!session) return
    if (!searchQuery.trim()) return
    
    console.log('Searching for:', searchQuery)
  }

  const handleExampleClick = (example: typeof examplePrompts[0]) => {
    setSearchQuery(example.prompt)
    setSelectedExample(example.id)
  }

  const isAuthenticated = status === 'authenticated' && session

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create MCP Servers
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Describe what you want to build and we'll generate an MCP server for you
          </p>
          
          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe the MCP server you want to create..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 pr-16"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={!isAuthenticated}
              />
              <button
                onClick={handleSearch}
                disabled={!isAuthenticated || !searchQuery.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-colors ${
                  isAuthenticated && searchQuery.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Login Message */}
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800">
                  Please sign in to create MCP servers
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Examples Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Example MCP Servers
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {examplePrompts.map((example) => (
              <div
                key={example.id}
                onClick={() => handleExampleClick(example)}
                className={`p-6 bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                  selectedExample === example.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {example.title}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {example.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {example.description}
                </p>
                <div className="text-sm text-blue-600 font-medium">
                  "{example.prompt}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>Click on any example to use it as a starting point, or describe your own MCP server</p>
        </div>
      </div>
    </div>
  )
}