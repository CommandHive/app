"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  path: string;
}

interface FileBrowserProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedFile?: string;
}

const FileBrowser = ({ files, onFileSelect, selectedFile }: FileBrowserProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-md mx-1 ${
            isSelected ? "bg-blue-50 text-blue-700" : "text-gray-800"
          }`}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path);
            } else {
              onFileSelect?.(node);
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              <div className="w-4 h-4 mr-1 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </div>
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-500" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-500" />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-4 h-4 mr-1"></div>
              <div className="w-4 h-4 mr-2 flex items-center justify-center">
                <File className="w-4 h-4 text-gray-500" />
              </div>
            </>
          )}
          <span className="text-sm font-medium truncate">{node.name}</span>
        </div>
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Files</h3>
      </div>
      <div className="py-2">
        {files.map(file => renderFileNode(file))}
      </div>
    </div>
  );
};

export default FileBrowser;