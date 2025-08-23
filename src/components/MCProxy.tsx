"use client";
import Image from "next/image";
import { useState } from "react";

const MCPProxyServer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const mcpServers = [
    {
      id: 1,
      name: "Web Scraping Server",
      description: "Create an MCP server that can scrape websites and extract structured data.",
      icon: "/mcpserver.svg", // Using available icon
      connected: false
    },
    {
      id: 2,
      name: "Web Scraping Server",
      description: "Create an MCP server that can scrape websites and extract structured data.",
      icon: "/mcpserver.svg",
      connected: true
    },
    {
      id: 3,
      name: "Web Scraping Server", 
      description: "Create an MCP server that can scrape websites and extract structured data.",
      icon: "/mcpserver.svg",
      connected: false
    }
  ];

  const filteredServers = mcpServers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = (serverId: number) => {
    console.log(`Connecting to server ${serverId}`);
  };

  return (
    <div className="h-full flex flex-col px-4 pb-6 gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center py-6">
          <h3 className="text-[24px] font-semibold text-black">Recommended MCP Servers</h3>
        </div>
        {/* Search Bar */}
        <div className="flex justify-between items-center gap-[13px]">
          <div className="w-full border border-gray-300 rounded-[880px] flex items-center gap-[12px] pl-4 py-3">
            <Image
              src={"/search-sm.svg"}
              alt="search"
              width={20}
              height={20}
            />
            <input
              type="text"
              placeholder="Search MCP Servers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full focus-within:outline-none placeholder:text-gray-700"
            />
          </div>
          {/* Sort Button */}
          <div className="w-[186px]">
            <button className="flex items-center gap-[12px] bg-[#FCFCFD] text-gray-800 px-4 py-3 rounded-full">
              <Image
                src={"/filter-lines.svg"}
                alt="sort"
                width={20}
                height={20}
              />
              Sort Servers
            </button>
          </div>
        </div>
      </div>

      {/* Server List */}
      <div className="flex flex-col gap-[28px]">
        {filteredServers.map((server) => (
          <div key={server.id} className="bg-white rounded-[12px] border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Server Icon */}
                  <Image
                    src={server.icon}
                    alt={server.name}
                    width={40}
                    height={40}
                  />
                {/* Server Info */}
                <div className="gap-3 flex flex-col">
                  <h3 className="text-[22px] font-semibold text-gray-900 flex items-center gap-3">
                    {server.name}
                    {server.connected && (
                      <div className="text-[#FCFCFD] text-sm bg-[#12B76A] px-2 pr-3 py-[6px] rounded-full flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/45 rounded-full relative shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <span className="text-[12px] font-semibold">Connected</span>
                      </div>
                    )}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {server.description}
                  </p>
                </div>
              </div>
              {/* Connect Button */}
              <button
                onClick={() => handleConnect(server.id)}
                className={`ml-4 px-4 py-2 hover:bg-gray-700 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${server.connected ? "bg-gray-100 text-gray-700" : "bg-gray-800 text-white"}`}
              >
                {server.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredServers.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No servers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPProxyServer;