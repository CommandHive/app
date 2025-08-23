/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";

interface Tool {
  instance: string;
  name: string;
  description: string;
  parameters: {
    properties: Record<string, any>;
    title: string;
    type: string;
  };
  is_async: boolean;
  output_schema: {
    properties: Record<string, any>;
    required: string[];
    title: string;
    type: string;
  };
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
}

interface ToolState {
  isExecuting: boolean;
  result: ExecutionResult | null;
}

interface ToolsCallProps {
  tools?: Tool[];
  onExecute?: (tool: Tool, parameters: Record<string, any>) => Promise<ExecutionResult> | ExecutionResult;
}

const ToolsCall = ({
  tools = [],
  onExecute
}: ToolsCallProps) => {
  // State to store parameter values for each tool
  const [toolParameters, setToolParameters] = useState<Record<string, Record<string, any>>>({});
  // State to store execution status and results for each tool
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});

  const updateParameter = (toolName: string, paramName: string, value: any) => {
    setToolParameters(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [paramName]: value
      }
    }));
  };

  const updateToolState = (toolName: string, updates: Partial<ToolState>) => {
    setToolStates(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        isExecuting: false,
        result: null,
        ...updates
      }
    }));
  };

  const handleExecute = async (tool: Tool) => {
    const parameters = toolParameters[tool.name] || {};
    
    // Set executing state
    updateToolState(tool.name, { isExecuting: true, result: null });
    
    try {
      if (onExecute) {
        const result = await onExecute(tool, parameters);
        updateToolState(tool.name, { 
          isExecuting: false, 
          result: result 
        });
      } else {
        // Default behavior when no onExecute is provided
        console.log(`Executing tool ${tool.name} with parameters:`, parameters);
        updateToolState(tool.name, { 
          isExecuting: false, 
          result: {
            success: true,
            message: `Tool ${tool.name} executed successfully`,
            data: parameters
          }
        });
      }
    } catch (error) {
      updateToolState(tool.name, { 
        isExecuting: false, 
        result: {
          success: false,
          message: `Failed to execute ${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: null
        }
      });
    }
  };

  const clearResult = (toolName: string) => {
    updateToolState(toolName, { result: null });
  };

  const getToolState = (toolName: string): ToolState => {
    return toolStates[toolName] || { isExecuting: false, result: null };
  };

  return (
    <div className="h-full flex flex-col px-4 pb-6">
      <div className="flex items-center py-6">
        <h3 className="text-[24px] font-semibold text-black">Available Tool Calls</h3>
      </div>
      <div className="flex flex-col gap-4">
        {tools.length > 0 ? (
          tools.map((tool, index) => {
            const state = getToolState(tool.name);
            
            return (
              <div key={tool.name || index} className="bg-[#FCFCFD] rounded-[12px] border border-gray-200 p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[18px] font-semibold text-black">
                    {tool.name}
                  </h3>
                  <p className="text-[16px] text-gray-600">
                    {tool.description}
                  </p>
                </div>
                             
                {/* Parameter inputs */}
                {Object.keys(tool.parameters?.properties || {}).length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(tool.parameters.properties).map(([key, paramSchema]: [string, any]) => (
                      <div key={key} className="flex flex-col gap-2">
                        <label className="block text-xs font-medium text-gray-800">
                          {key}:
                        </label>
                        <input
                          type={paramSchema.type === 'number' ? 'number' : 'text'}
                          value={toolParameters[tool.name]?.[key] || ''}
                          onChange={(e) => updateParameter(tool.name, key, e.target.value)}
                          placeholder={paramSchema.description || `Enter ${key}`}
                          className="bg-gray-100 rounded-[8px] px-3 py-2 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={state.isExecuting}
                        />
                      </div>
                    ))}
                  </div>
                )}
                             
                <button
                  onClick={() => handleExecute(tool)}
                  disabled={state.isExecuting}
                  className={`px-4 py-2 w-[103px] text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                    state.isExecuting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {state.isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="text-xs">Running...</span>
                    </>
                  ) : (
                    'Execute'
                  )}
                </button>

                {/* Result Display */}
                {state.result && (
                  <div className={`mt-2 p-4 rounded-[8px] border ${
                    state.result.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {state.result.success ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-sm">{state.result.message}</h6>
                        {state.result.data && (
                          <div className="mt-3">
                            <div className="text-xs font-medium mb-2">Response Data:</div>
                            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto font-mono max-h-40 overflow-y-auto">
                              {JSON.stringify(state.result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => clearResult(tool.name)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5"
                        title="Clear result"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No tools available yet</p>
            <p className="text-sm mt-2">Tools will appear here once your MCP server code is generated</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsCall;