import React, { useCallback } from 'react';
import { X, File, MessageSquare } from 'lucide-react';
import NewCodeEditor from './NewCodeEditor';
import { cn } from '../lib/utils';

/**
 * CodeTabs - VSCode-like multi-tab file editor
 *
 * Features:
 * - Multiple open files with closeable tabs
 * - Active tab highlighting
 * - File type icons
 * - Tab overflow handling
 * - Keyboard shortcuts (Ctrl+W to close tab)
 * - Chat toggle button
 */
function CodeTabs({
  selectedProject,
  openFiles,
  activeFileId,
  onFileClose,
  onFileSelect,
  onChatToggle,
  initialContent,
  className
}) {

  // Get file extension for icon
  const getFileIcon = useCallback((filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return '📄';
      case 'ts':
      case 'tsx':
        return '🔷';
      case 'py':
        return '🐍';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  }, []);

  // Close a file tab
  const closeFile = useCallback((fileId, event) => {
    if (event) {
      event.stopPropagation();
    }
    onFileClose(fileId);
  }, [onFileClose]);

  // Close all files
  const closeAllFiles = useCallback(() => {
    openFiles.forEach(file => onFileClose(file.id));
  }, [openFiles, onFileClose]);

  // Get active file
  const activeFile = openFiles.find(f => f.id === activeFileId);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeFileId) {
        e.preventDefault();
        closeFile(activeFileId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, closeFile]);

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-zinc-900", className)}>
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 min-h-[40px]">
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
            {openFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border-r border-zinc-200 dark:border-zinc-700 cursor-pointer group min-w-0 max-w-[200px]",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200",
                  file.id === activeFileId
                    ? "bg-white dark:bg-zinc-900 border-b-2 border-b-gemini-500"
                    : "bg-zinc-50 dark:bg-zinc-800"
                )}
              >
                <span className="text-sm flex-shrink-0">
                  {getFileIcon(file.name)}
                </span>
                <span className="text-sm truncate font-medium text-zinc-700 dark:text-zinc-300">
                  {file.name}
                </span>
                {file.isModified && (
                  <div className="w-2 h-2 bg-gemini-500 rounded-full flex-shrink-0" />
                )}
                <button
                  onClick={(e) => closeFile(file.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded transition-all duration-200 flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Tab Actions */}
          <div className="flex items-center px-2 border-l border-zinc-200 dark:border-zinc-700">
            {openFiles.length > 1 && (
              <button
                onClick={closeAllFiles}
                className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors duration-200 mr-2"
                title="Close All"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onChatToggle}
              className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors duration-200"
              title="Toggle Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 min-h-0">
        {activeFile ? (
          <NewCodeEditor
            file={activeFile}
            onClose={() => closeFile(activeFile.id)}
            projectPath={selectedProject?.path}
            initialContent={initialContent}
            hideCloseButton={true} // Hide the close button since tabs handle closing
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <File className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium mb-2">
                No files open
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                Select a file from the explorer to start editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeTabs;
