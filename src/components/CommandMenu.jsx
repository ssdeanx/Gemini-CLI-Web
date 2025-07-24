
import React from 'react';

const CommandMenu = ({ commands, onSelect, selectedIndex }) => {
  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 backdrop-blur-sm">
      {commands.map((command, index) => (
        <div
          key={command.command}
          className={`px-4 py-3 cursor-pointer border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 touch-manipulation ${
            index === selectedIndex
              ? 'bg-gemini-50 dark:bg-gemini-900/20 text-gemini-700 dark:text-gemini-300'
              : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(command);
          }}
        >
          <div className="font-medium text-sm">{command.command}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {command.description}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommandMenu;
