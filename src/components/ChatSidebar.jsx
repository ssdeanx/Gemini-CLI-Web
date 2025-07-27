import React from 'react';
import ChatInterface from './ChatInterface';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ChatSidebar - Integrated chat panel to replace ChatModal
 * 
 * Features:
 * - Collapsible sidebar panel
 * - Full ChatInterface integration
 * - Resizable width
 * - Modern glassmorphism design
 */
function ChatSidebar({ 
  isOpen, 
  onToggle, 
  selectedProject, 
  selectedSession, 
  ws, 
  sendMessage, 
  messages, 
  onFileOpen, 
  onInputFocusChange, 
  onSessionActive, 
  onSessionInactive, 
  onReplaceTemporarySession, 
  onNavigateToSession, 
  onShowSettings, 
  autoExpandTools, 
  showRawParameters, 
  autoScrollToBottom 
}) {
  const [width, setWidth] = React.useState(400);
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) {
        return;
      }

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-gemini-600 hover:bg-gemini-700 text-white p-3 rounded-l-lg shadow-elevated transition-all duration-300 glass-morphism glow-soft"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed right-0 top-0 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 z-50 flex flex-col glass-morphism dark:glass-morphism-dark shadow-elevated"
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-gemini-500 transition-colors duration-200 z-10"
          onMouseDown={handleMouseDown}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <h3 className="text-lg font-semibold text-gemini-700 dark:text-gemini-300">
            Gemini Chat
          </h3>
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all duration-300 morph-hover glow-minimal"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
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
    </>
  );
}

export default ChatSidebar;
