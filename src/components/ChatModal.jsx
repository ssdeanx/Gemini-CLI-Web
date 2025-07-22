import React from 'react';
import ChatInterface from './ChatInterface';
import { X } from 'lucide-react';

function ChatModal({ isOpen, onClose, selectedProject, selectedSession, ws, sendMessage, messages, onFileOpen, onInputFocusChange, onSessionActive, onSessionInactive, onReplaceTemporarySession, onNavigateToSession, onShowSettings, autoExpandTools, showRawParameters, autoScrollToBottom }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md h-full max-h-[35vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gemini-700 dark:text-gemini-300">Gemini Chat</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-auto">
          <ChatInterface
            selectedProject={selectedProject}
            selectedSession={selectedSession}
            ws={ws}
            sendMessage={sendMessage}
            messages={messages}
            onFileOpen={onFileOpen}
            onInputFocusChange={onInputFocusChange}
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
    </div>
  );
}

export default ChatModal;
