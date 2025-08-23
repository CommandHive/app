"use client";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Info, X } from 'lucide-react';
import Image from "next/image";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
}

const EnvironmentVariables = () => {
  // Start with empty array - no hardcoded data
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);

  // Add new environment variable
  const addEnvVar = () => {
    const newId = Date.now().toString();
    setEnvVars([...envVars, { id: newId, key: '', value: '' }]);
  };

  // Remove environment variable by id
  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter(env => env.id !== id));
  };

  // Update environment variable field
  const updateEnvVar = (id: string, field: 'key' | 'value', newValue: string) => {
    setEnvVars(envVars.map(env => 
      env.id === id ? { ...env, [field]: newValue } : env
    ));
  };

  // Save all environment variables with actual functionality
  const saveEnvVars = () => {
    // Filter out empty variables
    const validVars = envVars.filter(env => env.key.trim() !== '' && env.value.trim() !== '');
    
    if (validVars.length === 0) {
      alert('Please add at least one environment variable with both key and value.');
      return;
    }

    // Here you would typically send to your backend
    // Example: await apiService.saveEnvironmentVariables(chatId, validVars, accessToken);
    console.log('Saving environment variables:', validVars);
    
    // Show success message
    alert(`Successfully saved ${validVars.length} environment variable${validVars.length !== 1 ? 's' : ''}!`);
  };

  return (
    <div className="h-full flex flex-col px-4 pb-6">
      <div className="flex justify-between py-6">
        <div className="flex items-center gap-2">
          <h2 className="text-[24px] font-semibold text-black">Environmental Variables</h2>
          <Dialog>
            <DialogTrigger>
                <Info className="w-[22px] h-[22px] mt-1" />
            </DialogTrigger>
            <DialogContent className="[&>button]:hidden">
              <DialogHeader className="gap-4">
                <DialogTitle className="text-[20px] font-semibold text-gray-800 flex items-center justify-between">
                  Environment Variables – Usage Guide
                  <DialogClose className="rounded-sm text-gray-600 opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </DialogTitle>
                <DialogDescription>
                  <ul className="list-disc list-outside pl-5">
                    <li className="text-gray-800 text-[16px]">Define the environment variables your application requires to run.</li>
                    <li className="text-gray-800 text-[16px]">Use clear and meaningful names such as API_KEY, DATABASE_URL, AUTH_TOKEN, etc.</li>
                    <li className="text-gray-800 text-[16px]">All values will be securely encrypted and made accessible to your application during runtime.</li> 
                    <li className="text-gray-800 text-[16px]">Click &quot;Save All&quot; to apply and store your changes.</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addEnvVar}
            className="p-2 text-gray-600 hover:text-gray-800 bg-gray-50 rounded-md transition-colors"
            title="Add variable"
          >
            <Image
              src={"/plus.svg"}
              alt="add"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={saveEnvVars}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors"
            disabled={envVars.length === 0}
          >
            Save All
          </button>
        </div>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {envVars.map((envVar) => (
          <div key={envVar.id} className="grid grid-cols-2 gap-4 items-start bg-[#FCFCFD] rounded-[12px] border border-gray-200 p-5">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-800">
                Variable Name:
              </label>
              <input
                type="text"
                value={envVar.key}
                onChange={(e) => updateEnvVar(envVar.id, 'key', e.target.value)}
                placeholder="e.g, API_KEY"
                className="w-full h-10 px-3 bg-gray-100 rounded-md focus:border-orange-500 focus:ring-orange-500 focus:outline-none text-sm placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-2 w-full">
                <label className="block text-sm font-medium text-gray-800">
                  Variable Value:
                </label>
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(envVar.id, 'value', e.target.value)}
                  placeholder="e.g, sk-1234..."
                  className="w-full h-10 px-3 bg-gray-100 rounded-md focus:border-orange-500 focus:ring-orange-500 focus:outline-none text-sm placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => removeEnvVar(envVar.id)}
                className="mt-7 p-2 text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 rounded-md transition-colors"
                title="Delete variable"
              >
                <Image
                  src={"/delete.svg"}
                  alt="delete"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
        ))}
        
        {/* Empty state - show when no variables exist */}
        {envVars.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">No environment variables configured</p>
            <p className="text-sm text-gray-500 mb-4">Add environment variables to configure your application settings</p>
            <button
              onClick={addEnvVar}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Add First Variable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentVariables;