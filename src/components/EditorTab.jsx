import { useState, useEffect } from 'react';
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
    <div className="flex h-full glass-morphism dark:glass-morphism-dark">
      <div className="w-1/4 border-r border-zinc-200 dark:border-zinc-700">
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
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">Select a file to edit</p>
            </div>
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
