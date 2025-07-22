import React, { useState, useEffect } from 'react';
import EditorFileTree from './EditorFileTree';
import NewCodeEditor from './NewCodeEditor';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';
import { api } from '../utils/api';

function EditorTab({ selectedProject, ws, sendMessage, messages, onSessionActive, onSessionInactive, onReplaceTemporarySession, onNavigateToSession, onShowSettings, autoExpandTools, showRawParameters, autoScrollToBottom }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileOpen = (filePath, diffInfo = null) => {
    const file = {
      name: filePath.split('/').pop(),
      path: filePath,
      projectName: selectedProject?.name,
      diffInfo: diffInfo
    };
    setSelectedFile(file);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'assistant' && latestMessage.isToolUse && latestMessage.toolName === 'Edit') {
        try {
          const toolInput = JSON.parse(latestMessage.toolInput);
          if (toolInput.file_path === selectedFile?.path) {
            setEditorContent(toolInput.new_string);
          }
        } catch (e) {
          console.error('Error parsing tool input:', e);
        }
      }
    }
  }, [messages, selectedFile]);

  return (
    <div className="flex h-full">
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
        <EditorFileTree selectedProject={selectedProject} onFileSelect={handleFileSelect} />
      </div>
      <div className="w-3/4 relative">
        {selectedFile ? (
          <NewCodeEditor
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            projectPath={selectedProject.path}
            initialContent={editorContent}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a file to edit</p>
          </div>
        )}
        <FloatingChatButton onClick={() => setIsChatOpen(true)} />
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          selectedProject={selectedProject}
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
        />
      </div>
    </div>
  );
}

export default EditorTab;
