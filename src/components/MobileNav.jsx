import React from 'react';
import { MessageSquare, Folder, Terminal, GitBranch, FileText, Globe } from 'lucide-react';

function MobileNav({ activeTab, setActiveTab, isInputFocused }) {
  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  const navItems = [
    {
      id: 'chat',
      icon: MessageSquare,
      onClick: () => setActiveTab('chat')
    },
    {
      id: 'shell',
      icon: Terminal,
      onClick: () => setActiveTab('shell')
    },
    {
      id: 'files',
      icon: Folder,
      onClick: () => setActiveTab('files')
    },
    {
      id: 'git',
      icon: GitBranch,
      onClick: () => setActiveTab('git')
    },
    {
      id: 'spec',
      icon: 'FileText',
      onClick: () => setActiveTab('spec')
    }
  ];

  return (
    <>
      <style>
        {`
          .mobile-nav-container {
            background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          }
          .mobile-nav-container:hover {
            background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          }
        `}
      </style>
      <div
        className={`mobile-nav-container fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-700 z-50 ios-bottom-safe transform transition-transform duration-300 ease-in-out shadow-elevated glass-morphism dark:glass-morphism-dark ${
          isInputFocused ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              onTouchStart={(e) => {
                e.preventDefault();
                item.onClick();
              }}
              className={`flex items-center justify-center p-2 rounded-lg min-h-[40px] min-w-[40px] relative touch-manipulation ${
                isActive
                  ? 'text-gemini-500 dark:text-gemini-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all duration-300'
              }`}
              aria-label={item.id}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gemini-500 dark:bg-gemini-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}

export default MobileNav;