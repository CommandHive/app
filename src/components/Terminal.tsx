"use client";
import { useState } from "react";

interface Command {
  prompt: string;
  command: string;
  output: string;
}

const Terminal = () => {
  // Start with empty array - no hardcoded commands
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    
    let output = '';
    
    // Handle empty command
    if (trimmedCommand === '') {
      const newCommands = [
        ...commands,
        { 
          prompt: "minime", 
          command: currentCommand, 
          output: ""
        }
      ];
      setCommands(newCommands);
      setCurrentCommand("");
      return;
    }

    // Command processing based on old TabbedInterface logic
    switch (trimmedCommand.toLowerCase()) {
      case 'help':
        output = 'Available commands:\n  help - Show this help message\n  clear - Clear terminal\n  date - Show current date\n  echo <text> - Echo text back\n  ls - List directory contents';
        break;
        
      case 'clear':
        setCommands([]);
        setCurrentCommand("");
        return;
        
      case 'date':
        output = new Date().toString();
        break;
        
      case 'ls':
        output = 'package.json\nsrc/\nbuild/\nnode_modules/\nREADME.md';
        break;
        
      default:
        // Handle echo command
        if (trimmedCommand.startsWith('echo ')) {
          output = trimmedCommand.substring(5);
        }
        // Handle git commands
        else if (trimmedCommand === 'git status') {
          output = 'On branch main\nnothing to commit, working tree clean';
        }
        else if (trimmedCommand === 'git branch') {
          output = '* main\n  develop';
        }
        // Unknown command
        else if (trimmedCommand !== '') {
          output = `Command not found: ${trimmedCommand}\nType "help" for available commands`;
        }
    }

    const newCommands = [
      ...commands,
      { 
        prompt: "minime", 
        command: currentCommand, 
        output: output
      }
    ];
    setCommands(newCommands);
    setCurrentCommand("");
  };

  const handleCommandSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand);
    }
  };

  const clearTerminal = () => {
    setCommands([]);
    setCurrentCommand("");
  };

  return (
    <div className="h-full p-4">
      <div className="bg-white rounded-lg h-full flex flex-col overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-[15px] bg-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-semibold text-gray-800 ml-2">minime@mac — 80 × 24</span>
          </div>
          <button
            onClick={clearTerminal}
            className="px-4 py-1 bg-white text-sm rounded-[8px] text-gray-800 cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Terminal Content */}
        <div className="flex-1 p-4 font-mono text-sm text-gray-800 overflow-y-auto">
          {commands.map((cmd, index) => (
            <div key={index} className="mb-2">
              {cmd.command && (
                <>
                  <div className="flex items-center">
                    <span className="text-gray-800 font-semibold">{cmd.prompt}</span>
                    <span className="text-gray-800 mx-2">%</span>
                    <span className="text-gray-800">{cmd.command}</span>
                  </div>
                  {cmd.output && (
                    <div className="text-gray-400 mt-1 whitespace-pre-line">
                      {cmd.output}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          
          {/* Current Input Line */}
          <div className="flex items-center">
            <span className="text-gray-800 font-semibold">minime</span>
            <span className="text-gray-800 mx-2">%</span>
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleCommandSubmit}
              className="flex-1 bg-transparent text-gray-800 outline-none font-mono"
              placeholder=""
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;