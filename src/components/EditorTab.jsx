import { useState, useEffect } from 'react';
import EditorFileTree from './EditorFileTree';
import CodeTabs from './CodeTabs';
import ChatSidebar from './ChatSidebar';
import { api } from '../utils/api';

/**
 * EditorTab - Integrated code editor with multi-tab support and chat sidebar
 *
 * Features:
 * - VSCode-like multi-file editing with tabs
 * - Integrated chat sidebar for real-time code interaction
 * - Narrower file tree to accommodate chat sidebar
 * - No floating chat button or modal
 */
function EditorTab({
  selectedProject,
  selectedSession,
  ws,
  sendMessage,
  messages,
  onSessionActive,
  onSessionInactive,
  onReplaceTemporarySession,
  onNavigateToSession,
  onShowSettings,
  autoExpandTools,
  showRawParameters,
  autoScrollToBottom
}) {
  // State for managing open files and active file
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);

  // Handle file selection from file tree
  const handleFileSelect = async (file) => {
    try {
      // Create a unique ID for the file
      const fileId = `${file.path}-${Date.now()}`;

      // Check if file is already open
      const existingFile = openFiles.find(f => f.path === file.path);
      if (existingFile) {
        setActiveFileId(existingFile.id);
        return;
      }

      // Load file content
      const response = await api.readFile(selectedProject.name, file.path);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      // Create file object for CodeTabs
      const newFile = {
        id: fileId,
        name: file.name,
        path: file.path,
        projectName: selectedProject.name,
        content: data.content,
        isModified: false
      };

      // Add to open files and set as active
      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(fileId);
    } catch (error) {
      // Still create the file object even if loading fails
      const fileId = `${file.path}-${Date.now()}`;
      const newFile = {
        id: fileId,
        name: file.name,
        path: file.path,
        projectName: selectedProject.name,
        content: `// Error loading file: ${error.message}\n// Please check if the file exists and you have permission to read it.`,
        isModified: false
      };
      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(fileId);

      // Show user-friendly error notification
      alert(`Failed to open "${file.name}": ${error.message}`);
    }
  };

  // Handle file close from CodeTabs
  const handleFileClose = (fileId) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].id : null);
    }
  };

  // Handle file selection from CodeTabs
  const handleFileSelectFromTabs = (fileId) => {
    setActiveFileId(fileId);
  };

  // Handle file content changes
  const handleFileContentChange = (fileId, newContent, isModified) => {
    setOpenFiles(prev => prev.map(file =>
      file.id === fileId
        ? { ...file, content: newContent, isModified }
        : file
    ));
  };





  // Handle file opening from chat suggestions
  const handleFileOpen = async (filePath) => {
    try {
      // Normalize the file path (remove leading slash if present)
      const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

      // Check if file is already open
      const existingFile = openFiles.find(f => f.path === normalizedPath);
      if (existingFile) {
        setActiveFileId(existingFile.id);
        return;
      }

      // Create a unique ID for the file
      const fileId = `${normalizedPath}-${Date.now()}`;

      // Extract file name from path
      const fileName = normalizedPath.split('/').pop() || normalizedPath;

      // Load file content
      const response = await api.readFile(selectedProject.name, normalizedPath);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      // Create file object for CodeTabs
      const newFile = {
        id: fileId,
        name: fileName,
        path: normalizedPath,
        projectName: selectedProject.name,
        content: data.content,
        isModified: false
      };

      // Add to open files and set as active
      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(fileId);
    } catch (error) {
      console.error('Error opening file from chat:', error);

      // Still try to create the file object even if loading fails
      const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fileName = normalizedPath.split('/').pop() || normalizedPath;
      const fileId = `${normalizedPath}-${Date.now()}`;

      const newFile = {
        id: fileId,
        name: fileName,
        path: normalizedPath,
        projectName: selectedProject.name,
        content: `// Error loading file: ${error.message}\n// File path: ${normalizedPath}`,
        isModified: false
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(fileId);

      // Show user-friendly error
      alert(`Could not open file "${fileName}": ${error.message}`);
    }
  };

  // Toggle chat sidebar
  const handleChatToggle = () => {
    setIsChatSidebarOpen(prev => !prev);
  };

  // Reset when project changes
  useEffect(() => {
    if (selectedProject) {
      setOpenFiles([]);
      setActiveFileId(null);
    }
  }, [selectedProject]);

  return (
    <div className="flex h-full glass-morphism dark:glass-morphism-dark">
      {/* File Tree - Narrower to make room for chat sidebar */}
      <div className="w-1/5 border-r border-zinc-200 dark:border-zinc-700">
        <EditorFileTree
          selectedProject={selectedProject}
          onFileSelect={handleFileSelect}
          openFiles={openFiles}
        />
      </div>

      {/* Code Editor Area with Tabs */}
      <div className="flex-1 flex flex-col">
        <CodeTabs
          selectedProject={selectedProject}
          openFiles={openFiles}
          activeFileId={activeFileId}
          onFileClose={handleFileClose}
          onFileSelect={handleFileSelectFromTabs}
          onChatToggle={handleChatToggle}
          onFileContentChange={handleFileContentChange}
          onFileSave={(fileId, content) => {
            // Update file state after save
            setOpenFiles(prev => prev.map(file =>
              file.id === fileId
                ? { ...file, content, isModified: false }
                : file
            ));
          }}
          className="h-full"
        />
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatSidebarOpen}
        onToggle={handleChatToggle}
        selectedProject={selectedProject}
        selectedSession={selectedSession}
        ws={ws}
        sendMessage={sendMessage}
        messages={messages}
        onFileOpen={handleFileOpen}
        onSessionActive={onSessionActive}
        onSessionInactive={onSessionInactive}
        onReplaceTemporarySession={onReplaceTemporarySession}
        onNavigateToSession={onNavigateToSession}
        onShowSettings={onShowSettings}
        autoExpandTools={autoExpandTools}
        showRawParameters={showRawParameters}
        autoScrollToBottom={autoScrollToBottom}
        isIntegrated={true}
      />
    </div>
  );
}

export default EditorTab;
