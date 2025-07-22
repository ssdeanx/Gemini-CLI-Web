import React, { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Folder, FolderOpen, File } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../utils/api';

function EditorFileTree({ selectedProject, onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState(new Set());

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await api.getFiles(selectedProject.name);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (path) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={cn(
            'flex items-center p-2 rounded-md cursor-pointer',
            'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => {
            if (item.type === 'directory') {
              toggleDirectory(item.path);
            } else {
              onFileSelect(item);
            }
          }}
        >
          {item.type === 'directory' ? (
            expandedDirs.has(item.path) ? (
              <FolderOpen className="w-4 h-4 mr-2 text-gemini-500 dark:text-gemini-400" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            )
          ) : (
            <File className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-sm truncate">{item.name}</span>
        </div>
        {item.type === 'directory' && expandedDirs.has(item.path) && item.children && (
          <div>{renderFileTree(item.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <ScrollArea className="h-full">
      {renderFileTree(files)}
    </ScrollArea>
  );
}

export default EditorFileTree;