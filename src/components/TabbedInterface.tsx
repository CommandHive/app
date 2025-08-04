'use client'

import { useState } from 'react'
import { ClipboardIcon, CheckIcon, PlayIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface Tab {
  id: string
  name: string
  content: React.ReactNode
}

interface TabbedInterfaceProps {
  chatId: string
  chatData?: any
  messages?: any[]
}

interface ToolCall {
  id: string
  name: string
  description: string
  params: Record<string, any>
}

export default function TabbedInterface({ chatId, chatData, messages = [] }: TabbedInterfaceProps) {
  const [activeTab, setActiveTab] = useState('code')
  const [copied, setCopied] = useState(false)
  
  // Tool call states
  const [toolCallStates, setToolCallStates] = useState<Record<string, {
    isPaid: boolean
    amount: string
    isExecuting: boolean
  }>>({})

  // Environment variables state
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string; id: string }>>([
    { id: '1', key: 'API_KEY', value: '' },
    { id: '2', key: 'DATABASE_URL', value: '' }
  ])

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output'; content: string }>>([
    { type: 'output', content: 'Welcome to Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands' }
  ])
  const [currentInput, setCurrentInput] = useState('')

  // Sample tool calls data
  const toolCalls: ToolCall[] = [
    {
      id: 'swap_tokens',
      name: 'Swap Tokens',
      description: 'Exchange one cryptocurrency for another',
      params: {
        baseToken: 'SOL',
        quoteToken: 'USDC',
        amount: '100',
        orderType: 'MARKET_BUY'
      }
    },
    {
      id: 'supply_liquidity',
      name: 'Supply Liquidity',
      description: 'Add liquidity to a trading pool',
      params: {
        token0: 'SOL',
        token1: 'USDC',
        amount0: '50',
        amount1: '2500'
      }
    },
    {
      id: 'lending_supply',
      name: 'Lending Supply',
      description: 'Supply tokens to a lending protocol',
      params: {
        token: 'USDC',
        amount: '1000',
        protocol: 'Solend'
      }
    }
  ]

  // Initialize tool call states
  const initializeToolCallState = (toolId: string) => {
    if (!toolCallStates[toolId]) {
      setToolCallStates(prev => ({
        ...prev,
        [toolId]: {
          isPaid: false,
          amount: '',
          isExecuting: false
        }
      }))
    }
  }

  const updateToolCallState = (toolId: string, updates: Partial<typeof toolCallStates[string]>) => {
    setToolCallStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ...updates
      }
    }))
  }

  // Environment variables functions
  const addEnvVar = () => {
    const newId = Date.now().toString()
    setEnvVars([...envVars, { id: newId, key: '', value: '' }])
  }

  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter(env => env.id !== id))
  }

  const updateEnvVar = (id: string, field: 'key' | 'value', newValue: string) => {
    setEnvVars(envVars.map(env => 
      env.id === id ? { ...env, [field]: newValue } : env
    ))
  }

  const saveEnvVars = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving environment variables:', envVars)
    alert('Environment variables saved successfully!')
  }

  // Terminal functions
  const executeCommand = (command: string) => {
    const newHistory = [...terminalHistory, { type: 'input' as const, content: `$ ${command}` }]
    
    let output = ''
    switch (command.toLowerCase().trim()) {
      case 'help':
        output = 'Available commands:\n  help - Show this help message\n  clear - Clear terminal\n  date - Show current date\n  echo <text> - Echo text back\n  ls - List directory contents'
        break
      case 'clear':
        setTerminalHistory([])
        setCurrentInput('')
        return
      case 'date':
        output = new Date().toString()
        break
      case 'ls':
        output = 'package.json\nsrc/\nbuild/\nnode_modules/\nREADME.md'
        break
      default:
        if (command.startsWith('echo ')) {
          output = command.substring(5)
        } else if (command.trim() === '') {
          setTerminalHistory(newHistory)
          setCurrentInput('')
          return
        } else {
          output = `Command not found: ${command}\nType "help" for available commands`
        }
    }
    
    setTerminalHistory([...newHistory, { type: 'output', content: output }])
    setCurrentInput('')
  }

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput)
    }
  }

  const executeToolCall = async (toolCall: ToolCall) => {
    const state = toolCallStates[toolCall.id]
    if (state?.isPaid && !state.amount) {
      alert('Please enter an amount for paid execution')
      return
    }

    updateToolCallState(toolCall.id, { isExecuting: true })
    
    // Simulate API call
    setTimeout(() => {
      updateToolCallState(toolCall.id, { isExecuting: false })
      alert(`Executed ${toolCall.name} successfully!`)
    }, 2000)
  }

  // Get latest assistant message with code
  const getLatestMessageWithCode = () => {
    const assistantMessages = messages.filter(msg => msg.type === 'assistant' && msg.code)
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
  }

  // Get latest message deployment status
  const getLatestDeployableStatus = () => {
    const assistantMessages = messages.filter(msg => msg.type === 'assistant')
    const latestMessage = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
    return latestMessage?.is_deployable ?? false
  }

  // Extract code from latest message with priority to database messages
  const extractCodeFromResponse = (): string => {
    // First, try to get code from the latest message with code from database
    const latestMessage = getLatestMessageWithCode()
    
    if (latestMessage?.code) {
      try {
        // Handle JSON-wrapped code
        if (latestMessage.code.startsWith('```json')) {
          const jsonMatch = latestMessage.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || 'No code found in JSON';
          }
        }
        // Return raw code from database message
        return latestMessage.code;
      } catch (error) {
        console.error('Error extracting code from latest message:', error)
        return latestMessage.code || 'Error extracting code'
      }
    }
    
    // Only fallback to chatData if no messages with code exist in database
    if (chatData?.code && messages.length === 0) {
      try {
        if (chatData.code.startsWith('```json')) {
          const jsonMatch = chatData.code.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            return jsonData.code || 'No code found in JSON';
          }
        }
        return chatData.code;
      } catch (error) {
        console.error('Error extracting code from chatData:', error)
        return chatData.code || 'Error extracting code from response'
      }
    }
    
    return 'No code available yet...'
  }

  const copyToClipboard = async () => {
    const code = extractCodeFromResponse()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const ToolCallCard = ({ toolCall }: { toolCall: ToolCall }) => {
    // Initialize state if not exists
    if (!toolCallStates[toolCall.id]) {
      initializeToolCallState(toolCall.id)
    }

    const state = toolCallStates[toolCall.id] || { isPaid: false, amount: '', isExecuting: false }
    
    // Get first two parameters for display
    const paramEntries = Object.entries(toolCall.params).slice(0, 2)

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900">{toolCall.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{toolCall.description}</p>
        </div>
        
        {/* Parameters */}
        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Parameters:</h5>
          <div className="space-y-3">
            {paramEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-900">{key}:</label>
                <input
                  type="text"
                  defaultValue={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder={`Enter ${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Options and Execute Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-900">Payment:</span>
            <div className="relative">
              <select
                value={state.isPaid ? 'yes' : 'no'}
                onChange={(e) => updateToolCallState(toolCall.id, { 
                  isPaid: e.target.value === 'yes',
                  amount: e.target.value === 'no' ? '' : state.amount
                })}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no">Free</option>
                <option value="yes">Paid</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Amount Input (conditional) */}
            {state.isPaid && (
              <input
                type="number"
                placeholder="Amount"
                value={state.amount}
                onChange={(e) => updateToolCallState(toolCall.id, { amount: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Execute Button */}
          <button
            onClick={() => executeToolCall(toolCall)}
            disabled={state.isExecuting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              state.isExecuting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {state.isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
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
              {extractCodeFromResponse()}
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Status: {getLatestDeployableStatus() ? 'Deployable' : 'In Progress'}</p>
              {chatData?.usage && (
                <p className="text-xs text-blue-500 mt-1">
                  Tokens used: {chatData.usage.total_tokens} ({chatData.usage.prompt_tokens} prompt + {chatData.usage.completion_tokens} completion)
                </p>
              )}
              <div className="mt-3">
                <button
                  disabled={!getLatestDeployableStatus()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    getLatestDeployableStatus()
                      ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {getLatestDeployableStatus() ? 'Deploy Server' : 'Not Ready for Deployment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tool-calls',
      name: 'Tool Calls',
      content: (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Available Tool Calls</h3>
            <div className="text-sm text-gray-500">
              {toolCalls.length} tools available
            </div>
          </div>
          <div className="space-y-6">
            {toolCalls.map((toolCall) => (
              <ToolCallCard key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'env-vars',
      name: 'Environment Variables',
      content: (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Environment Variables</h3>
            <div className="flex space-x-3">
              <button
                onClick={addEnvVar}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Add Variable
              </button>
              <button
                onClick={saveEnvVars}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Save All
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {envVars.map((envVar) => (
              <div key={envVar.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Variable name (e.g., API_KEY)"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(envVar.id, 'key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Variable value"
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(envVar.id, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
                <button
                  onClick={() => removeEnvVar(envVar.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {envVars.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No environment variables configured.</p>
                <p className="text-sm mt-1">Click "Add Variable" to get started.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Usage Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Add environment variables that your application needs</li>
              <li>• Use descriptive names like API_KEY, DATABASE_URL, etc.</li>
              <li>• Values will be securely stored and available to your application</li>
              <li>• Click "Save All" to persist your changes</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      name: 'Terminal',
      content: (
        <div className="h-full bg-black text-green-400 font-mono text-sm">
          <div className="p-4 h-full flex flex-col">
            {/* Terminal Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-300 text-xs ml-4">Terminal — chat-{chatId}</span>
              </div>
              <button
                onClick={() => setTerminalHistory([])}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Clear
              </button>
            </div>
            
            {/* Terminal Content */}
            <div className="flex-1 overflow-y-auto mb-4">
              {terminalHistory.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry.type === 'input' ? (
                    <div className="text-green-400">{entry.content}</div>
                  ) : (
                    <div className="text-gray-300 whitespace-pre-line">{entry.content}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Terminal Input */}
            <div className="flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                className="flex-1 bg-transparent text-green-400 border-none outline-none font-mono"
                placeholder="Type a command..."
                autoFocus
              />
            </div>
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