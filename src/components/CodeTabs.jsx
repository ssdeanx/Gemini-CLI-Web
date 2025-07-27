import React, { useCallback, useState } from 'react';
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
  onFileContentChange, // New prop to track content changes
  onFileSave, // New prop to handle save events
  initialContent,
  className
}) {
  const [contextMenu, setContextMenu] = useState(null);

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

  // Close files to the right
  const closeFilesToRight = useCallback((targetFileId) => {
    const targetIndex = openFiles.findIndex(f => f.id === targetFileId);
    if (targetIndex >= 0) {
      const filesToClose = openFiles.slice(targetIndex + 1);
      filesToClose.forEach(file => onFileClose(file.id));
    }
  }, [openFiles, onFileClose]);

  // Close other files (all except the target)
  const closeOtherFiles = useCallback((targetFileId) => {
    openFiles.forEach(file => {
      if (file.id !== targetFileId) {
        onFileClose(file.id);
      }
    });
  }, [openFiles, onFileClose]);

  // Navigate to next/previous tab
  const navigateTab = useCallback((direction) => {
    if (openFiles.length <= 1) return;

    const currentIndex = openFiles.findIndex(f => f.id === activeFileId);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % openFiles.length;
    } else {
      nextIndex = currentIndex === 0 ? openFiles.length - 1 : currentIndex - 1;
    }

    onFileSelect(openFiles[nextIndex].id);
  }, [openFiles, activeFileId, onFileSelect]);

  // Get active file
  const activeFile = openFiles.find(f => f.id === activeFileId);

  // Handle content changes to track modified state
  const handleContentChange = useCallback((newContent, isModified) => {
    if (onFileContentChange && activeFile) {
      onFileContentChange(activeFile.id, newContent, isModified);
    }
  }, [onFileContentChange, activeFile]);

  // Handle save events
  const handleSave = useCallback((fileId, content, isModified) => {
    if (onFileSave) {
      onFileSave(fileId, content, isModified);
    }
  }, [onFileSave]);

  // Handle keyboard shortcuts (VSCode-like)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Close current tab (Ctrl+W)
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeFileId) {
        e.preventDefault();
        closeFile(activeFileId);
      }
      // Navigate tabs (Ctrl+Tab / Ctrl+Shift+Tab)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        navigateTab(e.shiftKey ? 'prev' : 'next');
      }
      // Navigate tabs with numbers (Ctrl+1, Ctrl+2, etc.)
      else if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < openFiles.length) {
          onFileSelect(openFiles[index].id);
        }
      }
      // Close all tabs (Ctrl+Shift+W)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        closeAllFiles();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFileId, closeFile, navigateTab, openFiles, onFileSelect, closeAllFiles]);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-zinc-900", className)}>
      {/* Tab Bar */}
      {openFiles.length > 0 && (
        <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-600 min-h-[35px] overflow-hidden">
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
            {openFiles.map((file, index) => (
              <div
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    fileId: file.id,
                    fileName: file.name
                  });
                }}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 cursor-pointer group min-w-0 max-w-[200px] border-r border-zinc-300 dark:border-zinc-600",
                  "transition-all duration-150 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  file.id === activeFileId
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-t-2 border-t-blue-500 dark:border-t-blue-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
                title={`${file.name}${file.isModified ? ' • Modified' : ''}\n${file.path}`}
                style={{
                  borderTopLeftRadius: file.id === activeFileId ? '4px' : '0',
                  borderTopRightRadius: file.id === activeFileId ? '4px' : '0'
                }}
              >
                {/* VSCode-style tab number indicator */}
                {index < 9 && (
                  <span className="absolute -top-1 left-1 text-xs text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-200 dark:bg-zinc-700 px-1 rounded">
                    {index + 1}
                  </span>
                )}

                {/* File icon */}
                <span className="text-sm flex-shrink-0">
                  {getFileIcon(file.name)}
                </span>

                {/* File name */}
                <span className={cn(
                  "text-sm truncate font-medium flex-1",
                  file.id === activeFileId
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {file.name}
                </span>

                {/* Modified indicator (VSCode-style dot) */}
                {file.isModified && (
                  <div className="w-2 h-2 bg-white dark:bg-zinc-300 rounded-full flex-shrink-0 ml-1" title="Unsaved changes" />
                )}

                {/* Close button */}
                <button
                  onClick={(e) => closeFile(file.id, e)}
                  className={cn(
                    "flex-shrink-0 p-1 rounded transition-all duration-200 ml-1",
                    file.isModified
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100",
                    "hover:bg-zinc-300 dark:hover:bg-zinc-600"
                  )}
                  title="Close (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Tab Actions - VSCode Style */}
          <div className="flex items-center px-2 bg-zinc-200 dark:bg-zinc-800 border-l border-zinc-300 dark:border-zinc-600">
            {openFiles.length > 1 && (
              <button
                onClick={closeAllFiles}
                className="p-1.5 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors duration-150 mr-1"
                title="Close All (Ctrl+Shift+W)"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onChatToggle}
              className="p-1.5 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors duration-150"
              title="Toggle Chat Sidebar"
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
            initialContent={activeFile.content || initialContent}
            hideCloseButton={true} // Hide the close button since tabs handle closing
            onContentChange={(content, isModified) => handleContentChange(content, isModified)}
            onSave={handleSave}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.fileId ? (
            // File-specific context menu
            <>
              <button
                onClick={() => {
                  closeFile(contextMenu.fileId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeOtherFiles(contextMenu.fileId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
              >
                Close Others
              </button>
              <button
                onClick={() => {
                  closeFilesToRight(contextMenu.fileId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
              >
                Close to the Right
              </button>
              <hr className="my-1 border-zinc-200 dark:border-zinc-600" />
              <div className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                {contextMenu.fileName}
              </div>
            </>
          ) : (
            // General tab actions menu
            <>
              <button
                onClick={() => {
                  closeAllFiles();
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
              >
                Close All Tabs
              </button>
              <hr className="my-1 border-zinc-200 dark:border-zinc-600" />
              <div className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                Keyboard Shortcuts:
              </div>
              <div className="px-4 py-1 text-xs text-zinc-400 dark:text-zinc-500">
                Ctrl+W - Close tab
              </div>
              <div className="px-4 py-1 text-xs text-zinc-400 dark:text-zinc-500">
                Ctrl+Tab - Next tab
              </div>
              <div className="px-4 py-1 text-xs text-zinc-400 dark:text-zinc-500">
                Ctrl+1-9 - Go to tab
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeTabs;
