'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ServerEarnings {
  id: string
  name: string
  description: string
  isPrivate: boolean
  totalToolCalls: number
  paidToolCalls: number
  earningsFromPaidCalls: number
  matchingFundEarnings: number
  totalEarnings: number
  lastUpdated: string
}

const placeholderData: ServerEarnings[] = [
  {
    id: '1',
    name: 'Weather API Server',
    description: 'Provides weather data and forecasts',
    isPrivate: false,
    totalToolCalls: 15420,
    paidToolCalls: 8250,
    earningsFromPaidCalls: 412.50,
    matchingFundEarnings: 125.30,
    totalEarnings: 537.80,
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Personal Finance Tracker',
    description: 'Private server for managing personal expenses and budgets',
    isPrivate: true,
    totalToolCalls: 2847,
    paidToolCalls: 0,
    earningsFromPaidCalls: 0,
    matchingFundEarnings: 0,
    totalEarnings: 0,
    lastUpdated: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    name: 'Image Processing Server',
    description: 'AI-powered image analysis and manipulation',
    isPrivate: false,
    totalToolCalls: 3210,
    paidToolCalls: 2890,
    earningsFromPaidCalls: 867.00,
    matchingFundEarnings: 156.20,
    totalEarnings: 1023.20,
    lastUpdated: '2024-01-15T08:45:00Z'
  },
  {
    id: '4',
    name: 'Home Automation Hub',
    description: 'Private IoT controller for smart home devices and scheduling',
    isPrivate: true,
    totalToolCalls: 12456,
    paidToolCalls: 0,
    earningsFromPaidCalls: 0,
    matchingFundEarnings: 0,
    totalEarnings: 0,
    lastUpdated: '2024-01-15T07:20:00Z'
  },
  {
    id: '5',
    name: 'Text Analysis Server',
    description: 'Natural language processing and sentiment analysis',
    isPrivate: false,
    totalToolCalls: 7654,
    paidToolCalls: 4321,
    earningsFromPaidCalls: 324.15,
    matchingFundEarnings: 67.80,
    totalEarnings: 391.95,
    lastUpdated: '2024-01-15T06:45:00Z'
  },
  {
    id: '6',
    name: 'Dev Tools Assistant',
    description: 'Private development utilities for code generation and testing',
    isPrivate: true,
    totalToolCalls: 8921,
    paidToolCalls: 0,
    earningsFromPaidCalls: 0,
    matchingFundEarnings: 0,
    totalEarnings: 0,
    lastUpdated: '2024-01-15T05:30:00Z'
  }
]

export default function MyEarnings() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [earnings, setEarnings] = useState<ServerEarnings[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/')
      return
    }

    // Simulate API call delay
    setTimeout(() => {
      setEarnings(placeholderData)
      setLoading(false)
    }, 1000)
  }, [isAuthenticated, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const publicServers = earnings.filter(server => !server.isPrivate)
  const totalEarnings = publicServers.reduce((sum, server) => sum + server.totalEarnings, 0)
  const totalToolCalls = earnings.reduce((sum, server) => sum + server.totalToolCalls, 0)
  const totalPaidCalls = publicServers.reduce((sum, server) => sum + server.paidToolCalls, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
          <p className="mt-2 text-gray-600">Track your earnings from deployed MCP servers</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
            <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Tool Calls</h3>
            <p className="text-3xl font-bold text-blue-600">{totalToolCalls.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Paid Tool Calls</h3>
            <p className="text-3xl font-bold text-purple-600">{totalPaidCalls.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Active Servers</h3>
            <p className="text-3xl font-bold text-indigo-600">{earnings.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              {publicServers.length} public, {earnings.length - publicServers.length} private
            </p>
          </div>
        </div>

        {/* Server Earnings Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Server Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matching Fund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{server.name}</div>
                        <div className="text-sm text-gray-500">{server.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {server.isPrivate ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Private
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Public
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.totalToolCalls.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.isPrivate ? 'N/A' : server.paidToolCalls.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {server.isPrivate ? 'N/A' : `$${server.earningsFromPaidCalls.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {server.isPrivate ? 'N/A' : `$${server.matchingFundEarnings.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {server.isPrivate ? 'N/A' : `$${server.totalEarnings.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(server.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How Earnings Work</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Tool Calls:</strong> Every time someone uses your MCP server tools</p>
            <p><strong>Paid Tool Calls:</strong> Tool calls from premium users or paid usage (public servers only)</p>
            <p><strong>Call Earnings:</strong> Direct revenue from paid tool usage (public servers only)</p>
            <p><strong>Matching Fund:</strong> Additional earnings from the MCP server pool based on usage and quality metrics (public servers only)</p>
            <p><strong>Private Servers:</strong> Do not generate earnings but still track total tool calls for your personal use</p>
          </div>
        </div>
      </div>
    </div>
  )
}