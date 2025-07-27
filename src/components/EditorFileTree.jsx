import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from './ui/scroll-area';
import {
  Folder,
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Search,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../utils/api';

function EditorFileTree({ selectedProject, onFileSelect, openFiles = [] }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);

  const searchInputRef = useRef(null);
  const treeRef = useRef(null);

  // Get appropriate icon for file type
  const getFileIcon = useCallback((filename, isDirectory = false) => {
    if (isDirectory) {
      return { icon: Folder, color: 'text-blue-500 dark:text-blue-400' };
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return { icon: FileCode, color: 'text-yellow-500 dark:text-yellow-400' };
      case 'py':
        return { icon: FileCode, color: 'text-green-500 dark:text-green-400' };
      case 'html':
      case 'htm':
        return { icon: FileCode, color: 'text-orange-500 dark:text-orange-400' };
      case 'css':
      case 'scss':
      case 'sass':
        return { icon: FileCode, color: 'text-blue-500 dark:text-blue-400' };
      case 'json':
      case 'xml':
        return { icon: FileText, color: 'text-gray-500 dark:text-gray-400' };
      case 'md':
      case 'txt':
        return { icon: FileText, color: 'text-gray-600 dark:text-gray-300' };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return { icon: FileImage, color: 'text-purple-500 dark:text-purple-400' };
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return { icon: FileVideo, color: 'text-red-500 dark:text-red-400' };
      case 'mp3':
      case 'wav':
      case 'ogg':
        return { icon: FileAudio, color: 'text-green-600 dark:text-green-300' };
      default:
        return { icon: File, color: 'text-gray-500 dark:text-gray-400' };
    }
  }, []);

  // Check if file is modified (has unsaved changes)
  const isFileModified = useCallback((filePath) => {
    return openFiles.some(file => file.path === filePath && file.isModified);
  }, [openFiles]);

  // Filter files based on search term
  const filterFiles = useCallback((items, term) => {
    if (!term) return items;

    return items.filter(item => {
      if (item.type === 'directory') {
        const hasMatchingChildren = item.children && filterFiles(item.children, term).length > 0;
        return item.name.toLowerCase().includes(term.toLowerCase()) || hasMatchingChildren;
      }
      return item.name.toLowerCase().includes(term.toLowerCase());
    }).map(item => {
      if (item.type === 'directory' && item.children) {
        return { ...item, children: filterFiles(item.children, term) };
      }
      return item;
    });
  }, []);

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





  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!focusedItem) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // TODO: Navigate to next item
        break;
      case 'ArrowUp':
        e.preventDefault();
        // TODO: Navigate to previous item
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusedItem.type === 'directory' && !expandedDirs.has(focusedItem.path)) {
          toggleDirectory(focusedItem.path);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedItem.type === 'directory' && expandedDirs.has(focusedItem.path)) {
          toggleDirectory(focusedItem.path);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedItem.type === 'file') {
          onFileSelect(focusedItem);
        } else {
          toggleDirectory(focusedItem.path);
        }
        break;
    }
  }, [focusedItem, expandedDirs, toggleDirectory, onFileSelect]);



  // Handle search input focus
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => {
      const { icon: IconComponent, color } = getFileIcon(item.name, item.type === 'directory');
      const isExpanded = expandedDirs.has(item.path);
      const isSelected = selectedItem === item.path;
      const isFocused = focusedItem?.path === item.path;
      const isModified = item.type === 'file' && isFileModified(item.path);

      return (
        <div key={item.path}>
          <div
            className={cn(
              'relative flex items-center p-1 px-2 rounded-md cursor-pointer group transition-all duration-150',
              'hover:bg-zinc-100 dark:hover:bg-zinc-700',
              isSelected && 'bg-gemini-100 dark:bg-gemini-900/30',
              isFocused && 'ring-1 ring-gemini-500 dark:ring-gemini-400'
            )}
            style={{ paddingLeft: `${level * 1.2 + 0.5}rem` }}
            onClick={() => {
              setSelectedItem(item.path);
              setFocusedItem(item);
              if (item.type === 'directory') {
                toggleDirectory(item.path);
              } else {
                onFileSelect(item);
              }
            }}

            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Expand/Collapse indicator for directories */}
            {item.type === 'directory' && (
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                {item.children && item.children.length > 0 && (
                  <div
                    className={cn(
                      "w-0 h-0 border-l-4 border-l-zinc-500 dark:border-l-zinc-400 transition-transform duration-150",
                      "border-t-2 border-t-transparent border-b-2 border-b-transparent",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </div>
            )}

            {/* File/Folder Icon */}
            <IconComponent
              className={cn(
                'w-4 h-4 mr-2 flex-shrink-0',
                item.type === 'directory'
                  ? isExpanded
                    ? 'text-gemini-500 dark:text-gemini-400'
                    : color
                  : color
              )}
            />

            {/* File/Folder Name */}
            <span className={cn(
              'text-sm truncate flex-1',
              isSelected
                ? 'text-gemini-700 dark:text-gemini-300 font-medium'
                : 'text-zinc-700 dark:text-zinc-300'
            )}>
              {item.name}
            </span>

            {/* Modified indicator */}
            {isModified && (
              <div
                className="w-2 h-2 bg-gemini-500 rounded-full flex-shrink-0 ml-1"
                title="Unsaved changes"
              />
            )}


          </div>

          {/* Render children for expanded directories */}
          {item.type === 'directory' && isExpanded && item.children && (
            <div className="transition-all duration-200 ease-in-out">
              {renderFileTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 dark:text-zinc-400">Loading files...</div>
      </div>
    );
  }

  const filteredFiles = filterFiles(files, searchTerm);

  return (
    <div
      className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col"
      ref={treeRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header with search */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
            Explorer
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Search files"
            >
              <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-gemini-500"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchTerm('');
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            >
              <X className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>
        )}
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">


            {filteredFiles.length > 0 ? (
              renderFileTree(filteredFiles)
            ) : searchTerm ? (
              <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8">
                No files found matching "{searchTerm}"
              </div>
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8">
                No files in this project
              </div>
            )}
          </div>
        </ScrollArea>
      </div>


    </div>
  );
}

export default EditorFileTree;