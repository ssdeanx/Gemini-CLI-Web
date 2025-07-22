import React from 'react';
import { MessageSquare } from 'lucide-react';

function FloatingChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gemini-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-gemini-700 transition-transform transform hover:scale-110 active:scale-100 z-50"
      aria-label="Open Chat"
    >
      <MessageSquare className="w-8 h-8" />
    </button>
  );
}

export default FloatingChatButton;
