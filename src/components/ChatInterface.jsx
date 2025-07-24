/*
 * ChatInterface.jsx - Chat Component with Session Protection Integration
 *
 * SESSION PROTECTION INTEGRATION:
 * ===============================
 *
 * This component integrates with the Session Protection System to prevent project updates
 * from interrupting active conversations:
 *
 * Key Integration Points:
 * 1. handleSubmit() - Marks session as active when user sends message (including temp ID for new sessions)
 * 2. session-created handler - Replaces temporary session ID with real WebSocket session ID
 * 3. gemini-complete handler - Marks session as inactive when conversation finishes
 * 4. session-aborted handler - Marks session as inactive when conversation is aborted
 *
 * This ensures uninterrupted chat experience by coordinating with App.jsx to pause sidebar updates.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import TodoList from './TodoList';
import GeminiLogo from './GeminiLogo.jsx';
import ThinkingIndicator from './SpecDesign/ThinkingIndicator';

import CommandMenu from './CommandMenu';
import GeminiStatus from './GeminiStatus';
import { MicButton } from './MicButton.jsx';
import { api } from '../utils/api';
import { playNotificationSound } from '../utils/notificationSound';

// Memoized message component to prevent unnecessary re-renders
const MessageComponent = memo(({ message, index, prevMessage, createDiff, onFileOpen, onShowSettings, autoExpandTools, showRawParameters }) => {
  const isGrouped = prevMessage && prevMessage.type === message.type &&
                    prevMessage.type === 'assistant' &&
                    !prevMessage.isToolUse && !message.isToolUse;
  const messageRef = React.useRef(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  React.useEffect(() => {
    if (!autoExpandTools || !messageRef.current || !message.isToolUse) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isExpanded) {
            setIsExpanded(true);
            // Find all details elements and open them
            const details = messageRef.current.querySelectorAll('details');
            details.forEach(detail => {
              detail.open = true;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [autoExpandTools, isExpanded, message.isToolUse]);

  return (
    <div
      ref={messageRef}
      className={`chat-message ${message.type} ${isGrouped ? 'grouped' : ''} ${message.type === 'user' ? 'flex justify-end px-3 sm:px-0' : 'px-3 sm:px-0'}`}
      style={{ minHeight: '1px' }} // Prevent collapse
    >
      {message.type === 'system' ? (
        /* System message in center */
        <div className="flex justify-center w-full py-2">
          <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg px-4 py-2 text-sm max-w-md text-center neumorphic-inset dark:neumorphic-inset-dark">
            {message.content}
          </div>
        </div>
      ) : message.type === 'user' ? (
        /* User message bubble on the right */
        <div className="flex items-end space-x-0 sm:space-x-3 w-full sm:w-auto sm:max-w-[85%] md:max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-gemini-600 text-white rounded-2xl rounded-br-md px-3 sm:px-4 py-2 shadow-layered glow-soft flex-1 sm:flex-initial">
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
            {message.images && message.images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {message.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.data}
                    alt={img.name}
                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(img.data, '_blank')}
                  />
                ))}
              </div>
            )}
            <div className="text-xs text-gemini-100 mt-1 text-right">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
          {!isGrouped && (
            <div className="hidden sm:flex w-8 h-8 bg-gemini-600 rounded-full items-center justify-center text-white text-sm shrink-0 glow-soft">
              U
            </div>
          )}
        </div>
      ) : (
        /* Gemini/Error messages on the left */
        <div className="w-full">
          {!isGrouped && (
            <div className="flex items-center space-x-3 mb-2">
              {message.type === 'error' ? (
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                  !
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 p-1">
                  <GeminiLogo className="w-full h-full" />
                </div>
              )}
              <div className="text-sm font-medium text-zinc-900 dark:text-white">
                {message.type === 'error' ? 'Error' : 'Gemini'}
              </div>
            </div>
          )}

          <div className="w-full">

            {message.isToolUse && !['Read', 'TodoWrite', 'TodoRead'].includes(message.toolName) ? (
              <div className="bg-gemini-50 dark:bg-gemini-900/20 border border-gemini-200 dark:border-gemini-800 rounded-lg p-2 sm:p-3 mb-2 glass-morphism dark:glass-morphism-dark">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gemini-600 rounded flex items-center justify-center glow-soft">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gemini-900 dark:text-gemini-100">
                      Using {message.toolName}
                    </span>
                    <span className="text-xs text-gemini-600 dark:text-gemini-400 font-mono">
                      {message.toolId}
                    </span>
                  </div>
                  {onShowSettings && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowSettings();
                      }}
                      className="p-1 rounded hover:bg-gemini-200 dark:hover:bg-gemini-800 transition-all duration-300 morph-hover"
                      title="Tool Settings"
                    >
                      <svg className="w-4 h-4 text-gemini-600 dark:text-gemini-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                {message.toolInput && message.toolName === 'Edit' && (() => {
                  try {
                    const input = JSON.parse(message.toolInput);
                    if (input.file_path && input.old_string && input.new_string) {
                      return (
                        <details className="mt-2" open={autoExpandTools}>
                          <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            📝 View edit diff for
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onFileOpen && onFileOpen(input.file_path, {
                                  old_string: input.old_string,
                                  new_string: input.new_string
                                });
                              }}
                              className="text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 underline font-mono"
                            >
                              {input.file_path.split('/').pop()}
                            </button>
                          </summary>
                          <div className="mt-3">
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                <button
                                  onClick={() => onFileOpen && onFileOpen(input.file_path, {
                                    old_string: input.old_string,
                                    new_string: input.new_string
                                  })}
                                  className="text-xs font-mono text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 truncate underline cursor-pointer"
                                >
                                  {input.file_path}
                                </button>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  Diff
                                </span>
                              </div>
                              <div className="text-xs font-mono">
                                {createDiff(input.old_string, input.new_string).map((diffLine, i) => (
                                  <div key={i} className="flex">
                                    <span className={`w-8 text-center border-r ${
                                      diffLine.type === 'removed'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                    }`}>
                                      {diffLine.type === 'removed' ? '-' : '+'}
                                    </span>
                                    <span className={`px-2 py-0.5 flex-1 whitespace-pre-wrap ${
                                      diffLine.type === 'removed'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                    }`}>
                                      {diffLine.content}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {showRawParameters && (
                              <details className="mt-2" open={autoExpandTools}>
                                <summary className="text-xs text-gemini-600 dark:text-gemini-400 cursor-pointer hover:text-gemini-700 dark:hover:text-gemini-300">
                                  View raw parameters
                                </summary>
                                <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-gemini-900 dark:text-gemini-100">
                                  {message.toolInput}
                                </pre>
                              </details>
                            )}
                          </div>
                        </details>
                      );
                    }
                  } catch (e) {
                    // Fall back to raw display if parsing fails
                  }
                  return (
                    <details className="mt-2" open={autoExpandTools}>
                      <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200">
                        View input parameters
                      </summary>
                      <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-gemini-900 dark:text-gemini-100">
                        {message.toolInput}
                      </pre>
                    </details>
                  );
                })()}
                {message.toolInput && message.toolName !== 'Edit' && (() => {
                  // Debug log to see what we're dealing with
                  // Debug - Tool display
                  // Special handling for Write tool
                  if (message.toolName === 'Write') {
                    // Debug - Write tool detected
                    try {
                      let input;
                      // Handle both JSON string and already parsed object
                      if (typeof message.toolInput === 'string') {
                        input = JSON.parse(message.toolInput);
                      } else {
                        input = message.toolInput;
                      }
                      // Debug - Parsed Write input
                      if (input.file_path && input.content !== undefined) {
                        return (
                          <details className="mt-2" open={autoExpandTools}>
                            <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              📄 Creating new file: 
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onFileOpen && onFileOpen(input.file_path, {
                                    old_string: '',
                                    new_string: input.content
                                  });
                                }}
                                className="text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 underline font-mono"
                              >
                                {input.file_path.split('/').pop()}
                              </button>
                            </summary>
                            <div className="mt-3">
                              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                  <button
                                    onClick={() => onFileOpen && onFileOpen(input.file_path, {
                                      old_string: '',
                                      new_string: input.content
                                    })}
                                    className="text-xs font-mono text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 truncate underline cursor-pointer"
                                  >
                                    {input.file_path}
                                  </button>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    New File
                                  </span>
                                </div>
                                <div className="text-xs font-mono">
                                  {createDiff('', input.content).map((diffLine, i) => (
                                    <div key={i} className="flex">
                                      <span className={`w-8 text-center border-r ${
                                        diffLine.type === 'removed'
                                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                          : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                      }`}>
                                        {diffLine.type === 'removed' ? '-' : '+'}
                                      </span>
                                      <span className={`px-2 py-0.5 flex-1 whitespace-pre-wrap ${
                                        diffLine.type === 'removed'
                                          ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                          : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                      }`}>
                                        {diffLine.content}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {showRawParameters && (
                                <details className="mt-2" open={autoExpandTools}>
                                  <summary className="text-xs text-gemini-600 dark:text-gemini-400 cursor-pointer hover:text-gemini-700 dark:hover:text-gemini-300">
                                    View raw parameters
                                  </summary>
                                  <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-gemini-900 dark:text-gemini-100">
                                    {message.toolInput}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </details>
                        );
                      }
                    } catch (e) {
                      // Fall back to regular display
                    }
                  }

                  // Special handling for TodoWrite tool
                  if (message.toolName === 'TodoWrite') {
                    try {
                      const input = JSON.parse(message.toolInput);
                      if (input.todos && Array.isArray(input.todos)) {
                        return (
                          <details className="mt-2" open={autoExpandTools}>
                            <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Updating Todo List
                            </summary>
                            <div className="mt-3">
                              <TodoList todos={input.todos} />
                              {showRawParameters && (
                                <details className="mt-3" open={autoExpandTools}>
                                  <summary className="text-xs text-gemini-600 dark:text-gemini-400 cursor-pointer hover:text-gemini-700 dark:hover:text-gemini-300">
                                    View raw parameters
                                  </summary>
                                  <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded overflow-x-auto text-gemini-900 dark:text-gemini-100">
                                    {message.toolInput}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </details>
                        );
                      }
                    } catch (e) {
                      // Fall back to regular display
                    }
                  }

                  // Special handling for Bash tool
                  if (message.toolName === 'Bash') {
                    try {
                      const input = JSON.parse(message.toolInput);
                      return (
                        <details className="mt-2" open={autoExpandTools}>
                          <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Running command
                          </summary>
                          <div className="mt-3 space-y-2">
                            <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-3 font-mono text-sm">
                              <div className="flex items-center gap-2 mb-2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs">Terminal</span>
                              </div>
                              <div className="whitespace-pre-wrap break-all text-green-400">
                                $ {input.command}
                              </div>
                            </div>
                            {input.description && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                {input.description}
                              </div>
                            )}
                            {showRawParameters && (
                              <details className="mt-2">
                                <summary className="text-xs text-gemini-500 dark:text-gemini-400 cursor-pointer hover:text-gemini-700 dark:hover:text-gemini-300">
                                  View raw parameters
                                </summary>
                                <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-gemini-900 dark:text-gemini-100">
                                  {message.toolInput}
                                </pre>
                              </details>
                            )}
                          </div>
                        </details>
                      );
                    } catch (e) {
                      // Fall back to regular display
                    }
                  }

                  // Special handling for Read tool
                  if (message.toolName === 'Read') {
                    try {
                      const input = JSON.parse(message.toolInput);
                      if (input.file_path) {
                        const filename = input.file_path.split('/').pop();

                        return (
                          <div className="mt-2 text-sm text-gemini-700 dark:text-gemini-300">
                            Read{' '}
                            <button
                              onClick={() => onFileOpen && onFileOpen(input.file_path)}
                              className="text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 underline font-mono"
                            >
                              {filename}
                            </button>
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fall back to regular display
                    }
                  }

                  // Special handling for exit_plan_mode tool
                  if (message.toolName === 'exit_plan_mode') {
                    try {
                      const input = JSON.parse(message.toolInput);
                      if (input.plan) {
                        // Replace escaped newlines with actual newlines
                        const planContent = input.plan.replace(/\n/g, '\n');
                        return (
                          <details className="mt-2" open={autoExpandTools}>
                            <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                              <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              📋 View implementation plan
                            </summary>
                            <div className="mt-3 prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>{planContent}</ReactMarkdown>
                            </div>
                          </details>
                        );
                      }
                    } catch (e) {
                      // Fall back to regular display
                    }
                  }

                  // Regular tool input display for other tools
                  return (
                    <details className="mt-2" open={autoExpandTools}>
                      <summary className="text-sm text-gemini-700 dark:text-gemini-300 cursor-pointer hover:text-gemini-800 dark:hover:text-gemini-200 flex items-center gap-2">
                        <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        View input parameters
                      </summary>
                      <pre className="mt-2 text-xs bg-gemini-100 dark:bg-gemini-800/30 p-2 rounded whitespace-pre-wrap break-words overflow-hidden text-gemini-900 dark:text-gemini-100">
                        {message.toolInput}
                      </pre>
                    </details>
                  );
                })()}

                {/* Tool Result Section */}
                {message.toolResult && (
                  <div className="mt-3 border-t border-gemini-200 dark:border-gemini-700 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        message.toolResult.isError
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {message.toolResult.isError ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${
                        message.toolResult.isError
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {message.toolResult.isError ? 'Tool Error' : 'Tool Result'}
                      </span>
                    </div>

                    <div className={`text-sm ${
                      message.toolResult.isError
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-green-800 dark:text-green-200'
                    }`}>
                      {(() => {
                        const content = String(message.toolResult.content || '');

                        // Special handling for TodoWrite/TodoRead results
                        if ((message.toolName === 'TodoWrite' || message.toolName === 'TodoRead') &&
                            (content.includes('Todos have been modified successfully') ||
                            content.includes('Todo list') || 
                            (content.startsWith('[') && content.includes('"content"') && content.includes('"status"')))) {
                          try {
                            // Try to parse if it looks like todo JSON data
                            let todos = null;
                            if (content.startsWith('[')) {
                              todos = JSON.parse(content);
                            } else if (content.includes('Todos have been modified successfully')) {
                              // For TodoWrite success messages, we don't have the data in the result
                              return (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">Todo list has been updated successfully</span>
                                  </div>
                                </div>
                              );
                            }

                            if (todos && Array.isArray(todos)) {
                              return (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="font-medium">Current Todo List</span>
                                  </div>
                                  <TodoList todos={todos} isResult={true} />
                                </div>
                              );
                            }
                          } catch (e) {
                            // Fall through to regular handling
                          }
                        }

                        // Special handling for exit_plan_mode tool results
                        if (message.toolName === 'exit_plan_mode') {
                          try {
                            // The content should be JSON with a "plan" field
                            const parsed = JSON.parse(content);
                            if (parsed.plan) {
                              // Replace escaped newlines with actual newlines
                              const planContent = parsed.plan.replace(/\n/g, '\n');
                              return (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="font-medium">Implementation Plan</span>
                                  </div>
                                  <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <ReactMarkdown>{planContent}</ReactMarkdown>
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            // Fall through to regular handling
                          }
                        }

                        // Special handling for interactive prompts
                        if (content.includes('Do you want to proceed?') && message.toolName === 'Bash') {
                          const lines = content.split('\n');
                          const promptIndex = lines.findIndex(line => line.includes('Do you want to proceed?'));
                          const beforePrompt = lines.slice(0, promptIndex).join('\n');
                          const promptLines = lines.slice(promptIndex);

                          // Extract the question and options
                          const questionLine = promptLines.find(line => line.includes('Do you want to proceed?')) || '';
                          const options = [];

                          // Parse numbered options (1. Yes, 2. No, etc.)
                          promptLines.forEach(line => {
                            const optionMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
                            if (optionMatch) {
                              options.push({
                                number: optionMatch[1],
                                text: optionMatch[2].trim()
                              });
                            }
                          });

                          // Find which option was selected (usually indicated by "> 1" or similar)
                          const selectedMatch = content.match(/>\s*(\d+)/);
                          const selectedOption = selectedMatch ? selectedMatch[1] : null;

                          return (
                            <div className="space-y-3">
                              {beforePrompt && (
                                <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                  <pre className="whitespace-pre-wrap break-words">{beforePrompt}</pre>
                                </div>
                              )}
                              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-base mb-2">
                                      Interactive Prompt
                                    </h4>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                                      {questionLine}
                                    </p>

                                    {/* Option buttons */}
                                    <div className="space-y-2 mb-4">
                                      {options.map((option) => (
                                        <button
                                          key={option.number}
                                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                            selectedOption === option.number
                                              ? 'bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-md'
                                              : 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm'
                                          } ${
                                            selectedOption ? 'cursor-default' : 'cursor-not-allowed opacity-75'
                                          }`}
                                          disabled
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                              selectedOption === option.number
                                                ? 'bg-white/20'
                                                : 'bg-amber-100 dark:bg-amber-800/50'
                                            }`}>
                                              {option.number}
                                            </span>
                                            <span className="text-sm sm:text-base font-medium flex-1">
                                              {option.text}
                                            </span>
                                            {selectedOption === option.number && (
                                              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                        </button>
                                      ))}
                                    </div>

                                    {selectedOption && (
                                      <div className="bg-amber-100 dark:bg-amber-800/30 rounded-lg p-3">
                                        <p className="text-amber-900 dark:text-amber-100 text-sm font-medium mb-1">
                                          ✓ Gemini selected option {selectedOption}
                                        </p>
                                        <p className="text-amber-800 dark:text-amber-200 text-xs">
                                          In the CLI, you would select this option interactively using arrow keys or by typing the number.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const fileEditMatch = content.match(/The file (.+?) has been updated\./);
                        if (fileEditMatch) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">File updated successfully</span>
                              </div>
                              <button
                                onClick={() => onFileOpen && onFileOpen(fileEditMatch[1])}
                                className="text-xs font-mono bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded text-gemini-500 dark:text-gemini-400 hover:text-gemini-600 dark:hover:text-gemini-300 underline cursor-pointer"
                              >
                                {fileEditMatch[1]}
                              </button>
                            </div>
                          );
                        }

                        // Handle Write tool output for file creation
                        const fileCreateMatch = content.match(/(?:The file|File) (.+?) has been (?:created|written)(?: successfully)?\.?/);
                        if (fileCreateMatch) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">File created successfully</span>
                              </div>
                              <button
                                onClick={() => onFileOpen && onFileOpen(fileCreateMatch[1])}
                                className="text-xs font-mono bg-green-100 dark:bg-green-800/30 px-2 py-1 rounded text-gemini-500 dark:text-gemini-400 hover:text-gemini-600 dark:hover:text-gemini-300 underline cursor-pointer"
                              >
                                {fileCreateMatch[1]}
                              </button>
                            </div>
                          );
                        }

                        // Special handling for Write tool - hide content if it's just the file content
                        if (message.toolName === 'Write' && !message.toolResult.isError) {
                          // For Write tool, the diff is already shown in the tool input section
                          // So we just show a success message here
                          return (
                            <div className="text-green-700 dark:text-green-300">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">File written successfully</span>
                              </div>
                              <p className="text-xs mt-1 text-green-600 dark:text-green-400">
                                The file content is displayed in the diff view above
                              </p>
                            </div>
                          );
                        }

                        if (content.includes('cat -n') && content.includes('→')) {
                          return (
                            <details open={autoExpandTools}>
                              <summary className="text-sm text-green-700 dark:text-green-300 cursor-pointer hover:text-green-800 dark:hover:text-green-200 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                View file content
                              </summary>
                              <div className="mt-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="text-xs font-mono p-3 whitespace-pre-wrap break-words overflow-hidden">
                                  {content}
                                </div>
                              </div>
                            </details>
                          );
                        }

                        if (content.length > 300) {
                          return (
                            <details open={autoExpandTools}>
                              <summary className="text-sm text-green-700 dark:text-green-300 cursor-pointer hover:text-green-800 dark:hover:text-green-200 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                View full output ({content.length} chars)
                              </summary>
                              <div className="mt-2 prose prose-sm max-w-none prose-green dark:prose-invert">
                                <ReactMarkdown>{content}</ReactMarkdown>
                              </div>
                            </details>
                          );
                        }

                        return (
                          <div className="prose prose-sm max-w-none prose-green dark:prose-invert">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : message.isInteractivePrompt ? (
              // Special handling for interactive prompts
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-base mb-3">
                      Interactive Prompt
                    </h4>
                    {(() => {
                      const lines = message.content.split('\n').filter(line => line.trim());
                      const questionLine = lines.find(line => line.includes('?')) || lines[0] || '';
                      const options = [];

                      // Parse the menu options
                      lines.forEach(line => {
                        // Match lines like "❯ 1. Yes" or "  2. No"
                        const optionMatch = line.match(/[❯\s]*(\d+)\.\s+(.+)/);
                        if (optionMatch) {
                          const isSelected = line.includes('❯');
                          options.push({
                            number: optionMatch[1],
                            text: optionMatch[2].trim(),
                            isSelected
                          });
                        }
                      });

                      return (
                        <>
                          <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                            {questionLine}
                          </p>

                          {/* Option buttons */}
                          <div className="space-y-2 mb-4">
                            {options.map((option) => (
                              <button
                                key={option.number}
                                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                  option.isSelected
                                    ? 'bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700'
                                } cursor-not-allowed opacity-75`}
                                disabled
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    option.isSelected
                                      ? 'bg-white/20'
                                      : 'bg-amber-100 dark:bg-amber-800/50'
                                  }`}>
                                    {option.number}
                                  </span>
                                  <span className="text-sm sm:text-base font-medium flex-1">
                                    {option.text}
                                  </span>
                                  {option.isSelected && (
                                    <span className="text-lg">❯</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="bg-amber-100 dark:bg-amber-800/30 rounded-lg p-3">
                            <p className="text-amber-900 dark:text-amber-100 text-sm font-medium mb-1">
                              ⏳ Waiting for your response in the CLI
                            </p>
                            <p className="text-amber-800 dark:text-amber-200 text-xs">
                              Please select an option in your terminal where Gemini is running.
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : message.isToolUse && message.toolName === 'Read' ? (
              // Simple Read tool indicator
              (() => {
                try {
                  const input = JSON.parse(message.toolInput);
                  if (input.file_path) {
                    const filename = input.file_path.split('/').pop();
                    return (
                      <div className="bg-gemini-50 dark:bg-gemini-900/20 border-l-2 border-gemini-300 dark:border-gemini-600 pl-3 py-1 mb-2 text-sm text-gemini-700 dark:text-gemini-300">
                        📖 Read{' '}
                        <button
                          onClick={() => onFileOpen && onFileOpen(input.file_path)}
                          className="text-gemini-600 dark:text-gemini-400 hover:text-gemini-700 dark:hover:text-gemini-300 underline font-mono"
                        >
                          {filename}
                        </button>
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div className="bg-gemini-50 dark:bg-gemini-900/20 border-l-2 border-gemini-300 dark:border-gemini-600 pl-3 py-1 mb-2 text-sm text-gemini-700 dark:text-gemini-300">
                      📖 Read file
                    </div>
                  );
                }
              })()
            ) : message.isToolUse && message.toolName === 'TodoWrite' ? (
              // Simple TodoWrite tool indicator with tasks
              (() => {
                try {
                  const input = JSON.parse(message.toolInput);
                  if (input.todos && Array.isArray(input.todos)) {
                    return (
                      <div className="bg-gemini-50 dark:bg-gemini-900/20 border-l-2 border-gemini-300 dark:border-gemini-600 pl-3 py-1 mb-2">
                        <div className="text-sm text-gemini-700 dark:text-gemini-300 mb-2">
                          📝 Update todo list
                        </div>
                        <TodoList todos={input.todos} />
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div className="bg-gemini-50 dark:bg-gemini-900/20 border-l-2 border-gemini-300 dark:border-gemini-600 pl-3 py-1 mb-2 text-sm text-gemini-700 dark:text-gemini-300">
                      📝 Update todo list
                    </div>
                  );
                }
              })()
            ) : message.isToolUse && message.toolName === 'TodoRead' ? (
              // Simple TodoRead tool indicator
              <div className="bg-gemini-50 dark:bg-gemini-900/20 border-l-2 border-gemini-300 dark:border-gemini-600 pl-3 py-1 mb-2 text-sm text-gemini-700 dark:text-gemini-300">
                📋 Read todo list
              </div>
            ) : (
              <div className={`text-sm ${message.type === 'error' ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 relative' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {message.type === 'error' && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message.content)
                        .catch(() => {
                          // Silently fail if clipboard access is denied
                        });
                    }}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Copy
                  </button>
                )}
                {message.type === 'assistant' ? (
                  <div className={`prose prose-sm max-w-none dark:prose-invert prose-zinc [&_code]:!bg-transparent [&_code]:!p-0 ${message.type === 'error' ? 'select-text cursor-text' : ''}`} style={{ contain: 'layout' }}>
                    <ReactMarkdown
                      components={{
                        code: ({node, inline, className, children, ...props}) => {
                          return inline ? (
                            <strong className="text-gemini-600 dark:text-gemini-400 font-bold not-prose" {...props}>
                              {children}
                            </strong>
                          ) : (
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg overflow-hidden my-2">
                              <code className="text-zinc-800 dark:text-zinc-200 text-sm font-mono block whitespace-pre-wrap break-words" {...props}>
                                {children}
                              </code>
                            </div>
                          );
                        },
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic text-zinc-600 dark:text-zinc-400 my-2">
                            {children}
                          </blockquote>
                        ),
                        a: ({href, children}) => (
                          <a href={href} className="text-gemini-600 dark:text-gemini-400 hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        p: ({children}) => (
                          <p className="mb-2 last:mb-0">
                            {children}
                          </p>
                        )
                      }}
                    >
                      {String(message.content || '')}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap ${message.type === 'error' ? 'select-all cursor-text pr-16' : ''}`}>
                    {message.content}
                  </div>
                )}
              </div>
            )}

            <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isGrouped ? 'opacity-0 group-hover:opacity-100' : ''}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ImageAttachment component for displaying image previews
const ImageAttachment = ({ file, onRemove, uploadProgress, error }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative group">
      <img src={preview} alt={file.name} className="w-20 h-20 object-cover rounded" />
      {uploadProgress !== undefined && uploadProgress < 100 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-xs">{uploadProgress}%</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ChatInterface: Main chat component with Session Protection System integration
//
// Session Protection System prevents automatic project updates from interrupting active conversations:
// - onSessionActive: Called when user sends message to mark session as protected
// - onSessionInactive: Called when conversation completes/aborts to re-enable updates
// - onReplaceTemporarySession: Called to replace temporary session ID with real WebSocket session ID
//
// This ensures uninterrupted chat experience by pausing sidebar refreshes during conversations.
function ChatInterface({ selectedProject, selectedSession, ws, sendMessage, messages, onFileOpen, onInputFocusChange, onSessionActive, onSessionInactive, onReplaceTemporarySession, onNavigateToSession, onShowSettings, autoExpandTools, showRawParameters, autoScrollToBottom }) {
  const [input, setInput] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      return localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
    }
    return '';
  });
  const [chatMessages, setChatMessages] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      const saved = localStorage.getItem(`chat_messages_${selectedProject.name}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isYoloMode, setIsYoloMode] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('gemini-tools-settings') || '{}');
      return settings.skipPermissions || false;
    } catch (e) {
      return false;
    }
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('gemini-tools-settings') || '{}');
      return settings.selectedModel || 'gemini-2.5-flash';
    } catch (e) {
      return 'gemini-2.5-flash';
    }
  });
  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(false);
  const [isSystemSessionChange, setIsSystemSessionChange] = useState(false);
  const [permissionMode, setPermissionMode] = useState('default');
  const [attachedImages, setAttachedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(new Map());
  const [imageErrors, setImageErrors] = useState(new Map());
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [debouncedInput, setDebouncedInput] = useState('');
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const [canAbortSession, setCanAbortSession] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const scrollPositionRef = useRef({ height: 0, top: 0 });
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [dropdownViewMode, setDropdownViewMode] = useState('categories'); // 'categories', 'folders', 'files'
  const [allMatchingFolders, setAllMatchingFolders] = useState([]);
  const [allMatchingFiles, setAllMatchingFiles] = useState([]);
  const [slashCommands, setSlashCommands] = useState([
    { command: '/about', description: 'Show version information' },
    { command: '/auth', description: 'Change authentication method' },
    { command: '/bug', description: 'File a bug report' },
    { command: '/chat', description: 'Save, resume, or list conversations' },
    { command: '/clear', description: 'Clear the terminal' },
    { command: '/compress', description: 'Compress chat context' },
    { command: '/editor', description: 'Change your preferred editor' },
    { command: '/exit', description: 'Exit the CLI' },
    { command: '/help', description: 'Show available commands' },
    { command: '/mcp', description: 'Show configured MCP servers' },
    { command: '/memory', description: 'Manage instructional context' },
    { command: '/quit', description: 'Exit the CLI' },
    { command: '/stats', description: 'Show session statistics' },
    { command: '/theme', description: 'Change the visual theme' },
    { command: '/tools', description: 'List available tools' },
  ]);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(-1);
  const [slashPosition, setSlashPosition] = useState(-1);
  const [visibleMessageCount, setVisibleMessageCount] = useState(100);
  
  // State for ThinkingIndicator
  const [isThinking, setIsThinking] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [toolCalls, setToolCalls] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [geminiStatus, setGeminiStatus] = useState(null);


  // Memoized diff calculation to prevent recalculating on every render
  const createDiff = useMemo(() => {
    const cache = new Map();
    return (oldStr, newStr) => {
      const key = `${oldStr.length}-${newStr.length}-${oldStr.slice(0, 50)}`;
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = calculateDiff(oldStr, newStr);
      cache.set(key, result);
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      return result;
    };
  }, []);

  // Load session messages from API
  const loadSessionMessages = useCallback(async (projectName, sessionId) => {
    if (!projectName || !sessionId) {
      return [];
    }
    
    setIsLoadingSessionMessages(true);
    try {
      const response = await api.sessionMessages(projectName, sessionId);
      if (!response.ok) {
        throw new Error('Failed to load session messages');
      }
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      // console.error('Error loading session messages:', error);
      return [];
    } finally {
      setIsLoadingSessionMessages(false);
    }
  }, []);

  // Actual diff calculation function
  const calculateDiff = (oldStr, newStr) => {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    
    // Simple diff algorithm - find common lines and differences
    const diffLines = [];
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];
      
      if (oldIndex >= oldLines.length) {
        // Only new lines remaining
        diffLines.push({ type: 'added', content: newLine, lineNum: newIndex + 1 });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only old lines remaining
        diffLines.push({ type: 'removed', content: oldLine, lineNum: oldIndex + 1 });
        oldIndex++;
      } else if (oldLine === newLine) {
        // Lines are the same - skip in diff view (or show as context)
        oldIndex++;
        newIndex++;
      } else {
        // Lines are different
        diffLines.push({ type: 'removed', content: oldLine, lineNum: oldIndex + 1 });
        diffLines.push({ type: 'added', content: newLine, lineNum: newIndex + 1 });
        oldIndex++;
        newIndex++;
      }
    }
    
    return diffLines;
  };

  const convertSessionMessages = (rawMessages) => {
    const converted = [];
    const toolResults = new Map(); // Map tool_use_id to tool result
    
    // First pass: collect all tool results
    for (const msg of rawMessages) {
      if (msg.message?.role === 'user' && Array.isArray(msg.message?.content)) {
        for (const part of msg.message.content) {
          if (part.type === 'tool_result') {
            toolResults.set(part.tool_use_id, {
              content: part.content,
              isError: part.is_error,
              timestamp: new Date(msg.timestamp || Date.now())
            });
          }
        }
      }
    }
    
    // Second pass: process messages and attach tool results to tool uses
    for (const msg of rawMessages) {
      // Handle user messages
      if (msg.message?.role === 'user' && msg.message?.content) {
        let content = '';
        let messageType = 'user';
        
        if (Array.isArray(msg.message.content)) {
          // Handle array content, but skip tool results (they're attached to tool uses)
          const textParts = [];
          
          for (const part of msg.message.content) {
            if (part.type === 'text') {
              textParts.push(part.text);
            }
            // Skip tool_result parts - they're handled in the first pass
          }
          
          content = textParts.join('\n');
        } else if (typeof msg.message.content === 'string') {
          content = msg.message.content;
        } else {
          content = String(msg.message.content);
        }
        
        // Skip command messages and empty content
        if (content && !content.startsWith('<command-name>') && !content.startsWith('[Request interrupted')) {
          converted.push({
            type: messageType,
            content: content,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      }
      
      // Handle assistant messages
      else if (msg.message?.role === 'assistant' && msg.message?.content) {
        if (Array.isArray(msg.message.content)) {
          for (const part of msg.message.content) {
            if (part.type === 'text') {
              converted.push({
                type: 'assistant',
                content: part.text,
                timestamp: msg.timestamp || new Date().toISOString()
              });
            } else if (part.type === 'tool_use') {
              // Get the corresponding tool result
              const toolResult = toolResults.get(part.id);
              
              converted.push({
                type: 'assistant',
                content: '',
                timestamp: msg.timestamp || new Date().toISOString(),
                isToolUse: true,
                toolName: part.name,
                toolInput: JSON.stringify(part.input),
                toolResult: toolResult ? (typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content)) : null,
                toolError: toolResult?.isError || false,
                toolResultTimestamp: toolResult?.timestamp || new Date()
              });
            }
          }
        } else if (typeof msg.message.content === 'string') {
          converted.push({
            type: 'assistant',
            content: msg.message.content,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      }
    }
    
    return converted;
  };

  // Memoize expensive convertSessionMessages operation
  const convertedMessages = useMemo(() => {
    return convertSessionMessages(sessionMessages);
  }, [sessionMessages]);

  // Define scroll functions early to avoid hoisting issues in useEffect dependencies
  const scrollToBottom = useCallback((instant = false) => {
    if (scrollContainerRef.current) {
      if (instant) {
        scrollContainerRef.current.classList.add('scroll-instant');
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        // Remove instant class after scroll
        requestAnimationFrame(() => {
          scrollContainerRef.current?.classList.remove('scroll-instant');
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
      setIsUserScrolledUp(false);
    }
  }, []);

  // Check if user is near the bottom of the scroll container
  const isNearBottom = useCallback(() => {
    if (!scrollContainerRef.current) {
      return false;
    }
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "near bottom" if within 50px of the bottom
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Handle scroll events to detect when user manually scrolls up
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const nearBottom = isNearBottom();
      setIsUserScrolledUp(!nearBottom);
    }
  }, [isNearBottom]);

  // Track previous session ID using useRef to properly detect session changes
  const previousSessionIdRef = useRef(null);
  
  useEffect(() => {
    // Load session messages when session changes
    const loadMessages = async () => {
      if (selectedSession && selectedProject) {
        // Check if this is actually a different session
        const isNewSession = previousSessionIdRef.current !== selectedSession.id;
        
        if (isNewSession) {
          // console.log('Loading messages for session:', selectedSession.id, 'previous:', previousSessionIdRef.current);
          previousSessionIdRef.current = selectedSession.id;
          setCurrentSessionId(selectedSession.id);
          
          // Only load messages from API if this is a user-initiated session change
          // For system-initiated changes, preserve existing messages and rely on WebSocket
          if (!isSystemSessionChange) {
            // Clear existing messages immediately to show loading state
            setChatMessages([]);
            setSessionMessages([]);
            
            setIsLoadingSessionMessages(true);
            try {
              const messages = await loadSessionMessages(selectedProject.name, selectedSession.id);
              setSessionMessages(messages);
              // convertedMessages will be automatically updated via useMemo
              // Scroll to bottom after loading session messages if auto-scroll is enabled
              if (autoScrollToBottom) {
                setTimeout(() => scrollToBottom(), 200);
              }
            } catch (error) {
              // console.error('Failed to load session messages:', error);
            } finally {
              setIsLoadingSessionMessages(false);
            }
          } else {
            // Reset the flag after handling system session change
            setIsSystemSessionChange(false);
          }
        }
      } else {
        setChatMessages([]);
        setSessionMessages([]);
        setCurrentSessionId(null);
        previousSessionIdRef.current = null;
      }
    };
    
    loadMessages();
  }, [selectedSession, selectedProject, loadSessionMessages, scrollToBottom, isSystemSessionChange, autoScrollToBottom]);

  // Update chatMessages when convertedMessages changes
  useEffect(() => {
    if (sessionMessages.length > 0) {
      setChatMessages(convertedMessages);
    }
  }, [convertedMessages, sessionMessages]);

  // Notify parent when input focus changes
  useEffect(() => {
    if (onInputFocusChange) {
      onInputFocusChange(isInputFocused);
    }
  }, [isInputFocused, onInputFocusChange]);

  // Persist input draft to localStorage
  useEffect(() => {
    if (selectedProject && input !== '') {
      localStorage.setItem(`draft_input_${selectedProject.name}`, input);
    } else if (selectedProject && input === '') {
      localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  }, [input, selectedProject]);

  // Persist chat messages to localStorage
  useEffect(() => {
    if (selectedProject && chatMessages.length > 0) {
      localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, selectedProject]);

  // Load saved state when project changes (but don't interfere with session loading)
  useEffect(() => {
    if (selectedProject) {
      // Always load saved input draft for the project
      const savedInput = localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
      if (savedInput !== input) {
        setInput(savedInput);
      }
    }
  }, [selectedProject?.name]);

  // Update YOLO mode when settings change
  useEffect(() => {
    const checkSettings = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('gemini-tools-settings') || '{}');
        setIsYoloMode(settings.skipPermissions || false);
        setSelectedModel(settings.selectedModel || 'gemini-2.5-flash');
      } catch (e) {
        setIsYoloMode(false);
        setSelectedModel('gemini-2.5-flash');
      }
    };
    
    // Check on mount and when storage changes
    checkSettings();
    
    const handleStorageChange = (e) => {
      if (e.key === 'gemini-tools-settings') {
        checkSettings();
        // Add a system message to notify settings have been applied
        setChatMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          type: 'system',
          content: '⚙️ 設定が更新されました。',
          timestamp: new Date().toISOString()
        }]);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check when component gains focus
    const handleFocus = () => checkSettings();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Handle WebSocket messages
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // console.log('Received WebSocket message:', latestMessage.type, latestMessage);
      
      switch (latestMessage.type) {
        case 'session-created':
          // New session created by Gemini CLI - we receive the real session ID here
          // Store it temporarily until conversation completes (prevents premature session association)
          if (latestMessage.sessionId && !currentSessionId) {
            sessionStorage.setItem('pendingSessionId', latestMessage.sessionId);
            
            // Session Protection: Replace temporary "new-session-*" identifier with real session ID
            // This maintains protection continuity - no gap between temp ID and real ID
            // The temporary session is removed and real session is marked as active
            if (onReplaceTemporarySession) {
              onReplaceTemporarySession(latestMessage.sessionId);
            }
          }
          break;
          
        case 'gemini-response':
          const messageData = latestMessage.data.message || latestMessage.data;
          
          // Handle Gemini CLI session duplication bug workaround:
          // When resuming a session, Gemini CLI creates a new session instead of resuming.
          // We detect this by checking for system/init messages with session_id that differs
          // from our current session. When found, we need to switch the user to the new session.
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id !== currentSessionId) {
            
            // Debug - Gemini CLI session duplication detected
            
            // Mark this as a system-initiated session change to preserve messages
            setIsSystemSessionChange(true);
            
            // Switch to the new session using React Router navigation
            // This triggers the session loading logic in App.jsx without a page reload
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return; // Don't process the message further, let the navigation handle it
          }
          
          // Handle system/init for new sessions (when currentSessionId is null)
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              !currentSessionId) {
            
            // Debug - New session init detected
            
            // Mark this as a system-initiated session change to preserve messages
            setIsSystemSessionChange(true);
            
            // Switch to the new session
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return; // Don't process the message further, let the navigation handle it
          }
          
          // For system/init messages that match current session, just ignore them
          if (latestMessage.data.type === 'system' && 
              latestMessage.data.subtype === 'init' && 
              latestMessage.data.session_id && 
              currentSessionId && 
              latestMessage.data.session_id === currentSessionId) {
            // Debug - System init message for current session, ignoring
            return; // Don't process the message further
          }
          
          // Handle different types of content in the response
          if (Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_use') {
                // Add tool use message
                const toolInput = part.input ? JSON.stringify(part.input, null, 2) : '';
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isToolUse: true,
                  toolName: part.name,
                  toolInput: toolInput,
                  toolId: part.id,
                  toolResult: null // Will be updated when result comes in
                }]);
                
                // Update thinking indicator with tool call
                setToolCalls(prev => [...prev, {
                  name: part.name,
                  status: 'running',
                  parameters: part.input,
                  id: part.id
                }]);
                setCurrentThought(`Executing ${part.name} tool...`);
                
              } else if (part.type === 'text' && part.text?.trim()) {
                // Add regular text message
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: part.text,
                  timestamp: new Date()
                }]);
                
                // Add to thoughts for thinking indicator
                setThoughts(prev => [...prev, part.text]);
              }
            }
          } else if (typeof messageData.content === 'string' && messageData.content.trim()) {
            // Add regular text message
            setChatMessages(prev => [...prev, {
              type: 'assistant',
              content: messageData.content,
              timestamp: new Date()
            }]);
            
            // Add to thoughts for thinking indicator
            setThoughts(prev => [...prev, messageData.content]);
          }
          
          // Handle tool results from user messages (these come separately)
          if (messageData.role === 'user' && Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_result') {
                // Find the corresponding tool use and update it with the result
                setChatMessages(prev => prev.map(msg => {
                  if (msg.isToolUse && msg.toolId === part.tool_use_id) {
                    return {
                      ...msg,
                      toolResult: {
                        content: part.content,
                        isError: part.is_error,
                        timestamp: new Date()
                      }
                    };
                  }
                  return msg;
                }));
                
                // Update thinking indicator tool call status
                setToolCalls(prev => prev.map(tool => 
                  tool.id === part.tool_use_id 
                    ? { 
                        ...tool, 
                        status: part.is_error ? 'error' : 'completed',
                        result: part.content
                      }
                    : tool
                ));
              }
            }
          }
          break;
          
        case 'gemini-output':
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: latestMessage.data,
            timestamp: new Date()
          }]);
          break;
        case 'gemini-interactive-prompt':
          // Handle interactive prompts from CLI
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: latestMessage.data,
            timestamp: new Date(),
            isInteractivePrompt: true
          }]);
          break;

        case 'gemini-error':
          // console.log('Gemini error, setting isLoading to false:', latestMessage.error);
          setChatMessages(prev => [...prev, {
            type: 'error',
            content: `Error: ${latestMessage.error}`,
            timestamp: new Date()
          }]);
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);
          break;
          
        case 'gemini-complete':
          // console.log('Gemini completed, setting isLoading to false');
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);

          // Play notification sound when response is complete
          playNotificationSound();
          
          // Stop thinking indicator
          setIsThinking(false);
          setCurrentThought('');
          
          // Session Protection: Mark session as inactive to re-enable automatic project updates
          // Conversation is complete, safe to allow project updates again
          // Use real session ID if available, otherwise use pending session ID
          const activeSessionId = currentSessionId || sessionStorage.getItem('pendingSessionId');
          if (activeSessionId && onSessionInactive) {
            onSessionInactive(activeSessionId);
          }
          
          // If we have a pending session ID and the conversation completed successfully, use it
          const pendingSessionId = sessionStorage.getItem('pendingSessionId');
          if (pendingSessionId && !currentSessionId && latestMessage.exitCode === 0) {
                setCurrentSessionId(pendingSessionId);
            sessionStorage.removeItem('pendingSessionId');
          }
          
          // Clear persisted chat messages after successful completion
          if (selectedProject && latestMessage.exitCode === 0) {
            localStorage.removeItem(`chat_messages_${selectedProject.name}`);
          }
          break;
          
        case 'session-aborted':
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);
          
          // Stop thinking indicator
          setIsThinking(false);
          setCurrentThought('');
          
          // Session Protection: Mark session as inactive when aborted
          // User or system aborted the conversation, re-enable project updates
          if (currentSessionId && onSessionInactive) {
            onSessionInactive(currentSessionId);
          }
          
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: 'Session interrupted by user.',
            timestamp: new Date()
          }]);
          break;

        case 'gemini-status':
          // Handle Gemini working status messages
          // Debug - Received gemini-status message
          const statusData = latestMessage.data;
          if (statusData) {
            // Parse the status message to extract relevant information
            let statusInfo = {
              text: 'Working...',
              tokens: 0,
              can_interrupt: true
            };
            
            // Check for different status message formats
            if (statusData.message) {
              statusInfo.text = statusData.message;
            } else if (statusData.status) {
              statusInfo.text = statusData.status;
            } else if (typeof statusData === 'string') {
              statusInfo.text = statusData;
            }
            
            // Extract token count
            if (statusData.tokens) {
              statusInfo.tokens = statusData.tokens;
            } else if (statusData.token_count) {
              statusInfo.tokens = statusData.token_count;
            }
            
            // Check if can interrupt
            if (statusData.can_interrupt !== undefined) {
              statusInfo.can_interrupt = statusData.can_interrupt;
            }
            
            // Debug - Setting claude status
            setGeminiStatus(statusInfo);
            setIsLoading(true);
            setCanAbortSession(statusInfo.can_interrupt);
            
            // Start thinking indicator
            setIsThinking(true);
            setCurrentThought('Starting to analyze your request...');
            setToolCalls([]);
            setThoughts([]);
          }
          break;
  
      }
    }
  }, [messages]);

  // Load file list when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchProjectFiles();
    }
  }, [selectedProject]);

  const fetchProjectFiles = async () => {
    try {
      const response = await api.getFiles(selectedProject.name);
      if (response.ok) {
        const files = await response.json();
        // Flatten the file tree to get all file paths
        const flatFiles = flattenFileTree(files);
        setFileList(flatFiles);
      }
    } catch (error) {
      // console.error('Error fetching files:', error);
    }
  };

  const flattenFileTree = (files, basePath = '') => {
    let result = [];
    for (const file of files) {
      const fullPath = basePath ? `${basePath}/${file.name}` : file.name;
      if (file.type === 'directory') {
        result.push({ name: file.name, path: fullPath, type: 'directory', relativePath: fullPath });
        if (file.children) {
          result = result.concat(flattenFileTree(file.children, fullPath));
        }
      } else if (file.type === 'file') {
        result.push({
          name: file.name,
          path: fullPath,
          relativePath: file.path,
          type: 'file'
        });
      }
    }
    return result;
  };

  // Handle @ symbol detection and file filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after the @ symbol (which would end the file reference)
      if (!textAfterAt.includes(' ')) {
        setAtSymbolPosition(lastAtIndex);
        setShowFileDropdown(true);
        
        // Filter files based on the text after @
        const matchingFiles = fileList.filter(file => 
          file.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
          file.path.toLowerCase().includes(textAfterAt.toLowerCase())
        );

        const folders = matchingFiles.filter(file => file.type === 'directory')
          .sort((a, b) => a.name.localeCompare(b.name));

        const files = matchingFiles.filter(file => file.type === 'file')
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllMatchingFolders(folders);
        setAllMatchingFiles(files);

        if (dropdownViewMode === 'categories') {
          const categoriesAndFiles = [];
          if (folders.length > 0) {
            categoriesAndFiles.push({ name: `Folders (${folders.length})`, type: 'category', category: 'folders', path: '' });
          }
          if (files.length > 0) {
            categoriesAndFiles.push({ name: `Files (${files.length})`, type: 'category', category: 'files', path: '' });
          }
          setFilteredFiles([...categoriesAndFiles, ...folders.slice(0, 5), ...files.slice(0, 5)]);
        } else if (dropdownViewMode === 'folders') {
          setFilteredFiles([{ name: '< Back to Categories', type: 'back-to-categories', path: '' }, ...folders]);
        } else if (dropdownViewMode === 'files') {
          setFilteredFiles([{ name: '< Back to Categories', type: 'back-to-categories', path: '' }, ...files]);
        }
        setSelectedFileIndex(-1);
      } else {
        setShowFileDropdown(false);
        setAtSymbolPosition(-1);
      }
    } else {
      setShowFileDropdown(false);
      setAtSymbolPosition(-1);
    }
  }, [input, cursorPosition, fileList, dropdownViewMode, allMatchingFolders, allMatchingFiles]);

  // Handle / symbol detection and command filtering
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex === 0) {
      const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
      if (!textAfterSlash.includes(' ')) {
        setSlashPosition(lastSlashIndex);
        setShowCommandMenu(true);

        const filtered = slashCommands.filter(cmd =>
          cmd.command.toLowerCase().includes(textAfterSlash.toLowerCase())
        ).slice(0, 10);

        setFilteredCommands(filtered);
        setSelectedCommandIndex(-1);
      } else {
        setShowCommandMenu(false);
        setSlashPosition(-1);
      }
    } else {
      setShowCommandMenu(false);
      setSlashPosition(-1);
    }
  }, [input, cursorPosition, slashCommands]);

  // Debounced input handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 150); // 150ms debounce
    
    return () => clearTimeout(timer);
  }, [input]);

  // Show only recent messages for better performance
  const visibleMessages = useMemo(() => {
    if (chatMessages.length <= visibleMessageCount) {
      return chatMessages;
    }
    return chatMessages.slice(-visibleMessageCount);
  }, [chatMessages, visibleMessageCount]);

  // Capture scroll position before render when auto-scroll is disabled
  useEffect(() => {
    if (!autoScrollToBottom && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      scrollPositionRef.current = {
        height: container.scrollHeight,
        top: container.scrollTop
      };
    }
  });

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollContainerRef.current && chatMessages.length > 0) {
      if (autoScrollToBottom) {
        // If auto-scroll is enabled, always scroll to bottom unless user has manually scrolled up
        if (!isUserScrolledUp) {
          setTimeout(() => scrollToBottom(), 50); // Small delay to ensure DOM is updated
        }
      } else {
        // When auto-scroll is disabled, preserve the visual position
        const container = scrollContainerRef.current;
        const prevHeight = scrollPositionRef.current.height;
        const prevTop = scrollPositionRef.current.top;
        const newHeight = container.scrollHeight;
        const heightDiff = newHeight - prevHeight;
        
        // If content was added above the current view, adjust scroll position
        if (heightDiff > 0 && prevTop > 0) {
          container.scrollTop = prevTop + heightDiff;
        }
      }
    }
  }, [chatMessages.length, isUserScrolledUp, scrollToBottom, autoScrollToBottom]);

  // Scroll to bottom when component mounts with existing messages or when messages first load
  useEffect(() => {
    if (scrollContainerRef.current && chatMessages.length > 0) {
      // Always scroll to bottom when messages first load (user expects to see latest)
      // Also reset scroll state
      setIsUserScrolledUp(false);
      setTimeout(() => scrollToBottom(true), 200); // Instant scroll on initial load
    }
  }, [chatMessages.length > 0, scrollToBottom]); // Trigger when messages first appear

  // Add scroll event listener to detect user scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Initial textarea setup
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';

      // Check if initially expanded
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
      setIsTextareaExpanded(isExpanded);
    }
  }, []); // Only run once on mount

  // Reset textarea height when input is cleared programmatically
  useEffect(() => {
    if (textareaRef.current && !input.trim()) {
      textareaRef.current.style.height = 'auto';
      setIsTextareaExpanded(false);
    }
  }, [input]);

  const handleTranscript = useCallback((text) => {
    if (text.trim()) {
      setInput(prevInput => {
        const newInput = prevInput.trim() ? `${prevInput} ${text}` : text;
        
        // Update textarea height after setting new content
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            
            // Check if expanded after transcript
            const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
            const isExpanded = textareaRef.current.scrollHeight > lineHeight * 2;
            setIsTextareaExpanded(isExpanded);
          }
        }, 0);
        
        return newInput;
      });
    }
  }, []);

  // Load earlier messages by increasing the visible message count
  const loadEarlierMessages = useCallback(() => {
    setVisibleMessageCount(prevCount => prevCount + 100);
  }, []);

  // Handle image files from drag & drop or file picker
  const handleImageFiles = useCallback((files) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageErrors(prev => new Map(prev).set(file.name, 'File too large (max 5MB)'));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setAttachedImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images
    }
  }, []);

  // Handle clipboard paste for images
  const handlePaste = useCallback(async (e) => {
    const items = Array.from(e.clipboardData.items);
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleImageFiles([file]);
        }
      }
    }
    
    // Fallback for some browsers/platforms
    if (items.length === 0 && e.clipboardData.files.length > 0) {
      const files = Array.from(e.clipboardData.files);
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        handleImageFiles(imageFiles);
      }
    }
  }, [handleImageFiles]);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    onDrop: handleImageFiles,
    noClick: true, // We'll use our own button
    noKeyboard: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedProject) {
      return;
    }

    // Reset thinking indicator for new conversation
    setIsThinking(false);
    setCurrentThought('');
    setToolCalls([]);
    setThoughts([]);

    // Upload images first if any
    let uploadedImages = [];
    if (attachedImages.length > 0) {
      const formData = new FormData();
      attachedImages.forEach(file => {
        formData.append('images', file);
      });
      
      try {
        const token = localStorage.getItem('auth-token');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/projects/${selectedProject.name}/upload-images`, {
          method: 'POST',
          headers: headers,
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload images');
        }
        
        const result = await response.json();
        uploadedImages = result.images;
      } catch (error) {
        // console.error('Image upload failed:', error);
        setChatMessages(prev => [...prev, {
          type: 'error',
          content: `Failed to upload images: ${error.message}`,
          timestamp: new Date()
        }]);
        return;
      }
    }

    const userMessage = {
      type: 'user',
      content: input,
      images: uploadedImages,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    // console.log('Setting isLoading to true after sending message');
    setIsLoading(true);
    setCanAbortSession(true);
    // Set a default status when starting
    setGeminiStatus({
      text: 'Processing',
      tokens: 0,
      can_interrupt: true
    });
    
    // Always scroll to bottom when user sends a message and reset scroll state
    setIsUserScrolledUp(false); // Reset scroll state so auto-scroll works for Gemini's response
    setTimeout(() => scrollToBottom(), 100); // Longer delay to ensure message is rendered

    // Session Protection: Mark session as active to prevent automatic project updates during conversation
    // This is crucial for maintaining chat state integrity. We handle two cases:
    // 1. Existing sessions: Use the real currentSessionId
    // 2. New sessions: Generate temporary identifier "new-session-{timestamp}" since real ID comes via WebSocket later
    // This ensures no gap in protection between message send and session creation
    const sessionToActivate = currentSessionId || `new-session-${Date.now()}`;
    if (onSessionActive) {
      onSessionActive(sessionToActivate);
    }

    // Get tools settings from localStorage
    const getToolsSettings = () => {
      try {
        const savedSettings = localStorage.getItem('gemini-tools-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          return {
            allowedTools: settings.allowedTools || [],
            disallowedTools: settings.disallowedTools || [],
            skipPermissions: settings.skipPermissions || false,
            selectedModel: settings.selectedModel || 'gemini-2.5-flash'
          };
        }
      } catch (error) {
        // console.error('Error loading tools settings:', error);
      }
      return {
        allowedTools: [],
        disallowedTools: [],
        skipPermissions: false,
        selectedModel: 'gemini-2.5-flash'
      };
    };

    const toolsSettings = getToolsSettings();

    // Send command to Gemini CLI via WebSocket with images
    sendMessage({
      type: 'gemini-command',
      command: input,
      options: {
        projectPath: selectedProject.path,
        cwd: selectedProject.path,
        sessionId: currentSessionId,
        resume: !!currentSessionId,
        toolsSettings: toolsSettings,
        permissionMode: permissionMode,
        model: toolsSettings.selectedModel || 'gemini-2.5-flash',
        images: uploadedImages // Pass images to backend
      }
    });

    setInput('');
    setAttachedImages([]);
    setUploadingImages(new Map());
    setImageErrors(new Map());
    setIsTextareaExpanded(false);
    
    // Reset textarea height


    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Clear the saved draft since message was sent
    if (selectedProject) {
      localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  };

  const handleKeyDown = (e) => {
    if (showCommandMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedCommandIndex >= 0) {
          selectCommand(filteredCommands[selectedCommandIndex]);
        } else if (filteredCommands.length > 0) {
          selectCommand(filteredCommands[0]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandMenu(false);
        return;
      }
    }

    // Handle file dropdown navigation
    if (showFileDropdown && filteredFiles.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedFileIndex(prev => 
          prev < filteredFiles.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedFileIndex(prev => 
          prev > 0 ? prev - 1 : filteredFiles.length - 1
        );
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (selectedFileIndex >= 0) {
          selectFile(filteredFiles[selectedFileIndex]);
        } else if (filteredFiles.length > 0) {
          selectFile(filteredFiles[0]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowFileDropdown(false);
        return;
      }
    }
    
    // Handle Tab key for mode switching (only when file dropdown is not showing)
    // Disabled for Gemini - no permission modes
    /*
    if (e.key === 'Tab' && !showFileDropdown) {
      e.preventDefault();
      const modes = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
      const currentIndex = modes.indexOf(permissionMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      setPermissionMode(modes[nextIndex]);
      return;
    }
    */
    
    // Handle Enter key: Ctrl+Enter (Cmd+Enter on Mac) sends, Shift+Enter creates new line
    if (e.key === 'Enter') {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Ctrl+Enter or Cmd+Enter: Send message
        e.preventDefault();
        handleSubmit(e);
      } else if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Plain Enter: Also send message (keeping original behavior)
        e.preventDefault();
        handleSubmit(e);
      }
      // Shift+Enter: Allow default behavior (new line)
    }
  };

  const selectFile = (file) => {
    if (file.type === 'category') {
      setDropdownViewMode(file.category);
      setSelectedFileIndex(-1); // Reset selection when changing view mode
      return;
    }

    const textBeforeAt = input.slice(0, atSymbolPosition);
    const textAfterAtQuery = input.slice(atSymbolPosition);
    const spaceIndex = textAfterAtQuery.indexOf(' ');
    const textAfterQuery = spaceIndex !== -1 ? textAfterAtQuery.slice(spaceIndex) : '';
    
    const newInput = textBeforeAt + '@' + file.path + ' ' + textAfterQuery;
    const newCursorPos = textBeforeAt.length + 1 + file.path.length + 1;
    
    // Immediately ensure focus is maintained
    if (textareaRef.current && !textareaRef.current.matches(':focus')) {
      textareaRef.current.focus();
    }
    
    // Update input and cursor position
    setInput(newInput);
    setCursorPosition(newCursorPos);
    
    // Hide dropdown
    setShowFileDropdown(false);
    setAtSymbolPosition(-1);
    
    // Set cursor position synchronously 
    if (textareaRef.current) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          // Ensure focus is maintained
          if (!textareaRef.current.matches(':focus')) {
            textareaRef.current.focus();
          }
        }
      });
    }
  };

  const selectCommand = (command) => {
    const textBeforeSlash = input.slice(0, slashPosition);
    const newInput = textBeforeSlash + command.command + ' ';
    const newCursorPos = newInput.length;

    if (textareaRef.current && !textareaRef.current.matches(':focus')) {
      textareaRef.current.focus();
    }

    setInput(newInput);
    setCursorPosition(newCursorPos);

    setShowCommandMenu(false);
    setSlashPosition(-1);

    if (textareaRef.current) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          if (!textareaRef.current.matches(':focus')) {
            textareaRef.current.focus();
          }
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    setCursorPosition(e.target.selectionStart);
    
    // Handle height reset when input becomes empty
    if (!newValue.trim()) {
      e.target.style.height = 'auto';
      setIsTextareaExpanded(false);
    }
  };

  const handleTextareaClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };



  const handleNewSession = () => {
    setChatMessages([]);
    setInput('');
    setIsLoading(false);
    setCanAbortSession(false);
  };
  
  const handleAbortSession = () => {
    if (currentSessionId && canAbortSession) {
      sendMessage({
        type: 'abort-session',
        sessionId: currentSessionId
      });
    }
  };

  const handleModeSwitch = () => {
    // Disabled for Gemini - no permission modes
    // const modes = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
    // const currentIndex = modes.indexOf(permissionMode);
    // const nextIndex = (currentIndex + 1) % modes.length;
    // setPermissionMode(modes[nextIndex]);
  };

  // Don't render if no project is selected
  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Select a project to start chatting with Gemini</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          details[open] .details-chevron {
            transform: rotate(180deg);
          }
        `}
      </style>
      <div className="h-full flex flex-col">
        {/* Messages Area - Scrollable Middle Section */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-3 sm:p-4 space-y-3 sm:space-y-4 relative"
        style={{
          scrollBehavior: 'smooth',
          // Force GPU acceleration for smoother scrolling
          transform: 'translateZ(0)',
          willChange: 'scroll-position'
        }}
      >
        {isLoadingSessionMessages && chatMessages.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 mt-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-400"></div>
              <p>Loading session messages...</p>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-500 dark:text-zinc-400 px-6 sm:px-4">
              <p className="font-bold text-lg sm:text-xl mb-3">Start a conversation with Gemini</p>
              <p className="text-sm sm:text-base leading-relaxed">
                Ask questions about your code, request changes, or get help with development tasks
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.length > visibleMessageCount && (
              <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-2 border-b border-zinc-200 dark:border-zinc-700">
                Showing last {visibleMessageCount} messages ({chatMessages.length} total) •
                <button
                  className="ml-1 text-gemini-600 hover:text-gemini-800 nderline"
                  onClick={loadEarlierMessages}
                >
                  Load earlier messages
                </button>
              </div>
            )}

            {visibleMessages.map((message, index) => {
              const prevMessage = index > 0 ? visibleMessages[index - 1] : null;

              return (
                <MessageComponent
                  key={`${message.id || index}-${message.timestamp}`}
                  message={message}
                  index={index}
                  prevMessage={prevMessage}
                  createDiff={createDiff}
                  onFileOpen={onFileOpen}
                  onShowSettings={onShowSettings}
                  autoExpandTools={autoExpandTools}
                  showRawParameters={showRawParameters}
                />
              );
            })}
          </>
        )}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="w-full">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                  C
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white">Gemini</div>
                {/* Abort button removed - functionality not yet implemented at backend */}
              </div>
              <div className="w-full text-sm text-zinc-500 dark:text-zinc-400 pl-3 sm:pl-0">
                <div className="flex items-center space-x-1">
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
                  <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
                  <span className="ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ThinkingIndicator for transparency into AI reasoning */}
        {(isThinking || toolCalls.length > 0 || thoughts.length > 0) && (
          <div className="px-4 mb-4">
            <ThinkingIndicator
              isThinking={isThinking}
              currentThought={currentThought}
              toolCalls={toolCalls}
              thoughts={thoughts}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* Input Area - Fixed Bottom */}
      <div className={`p-2 sm:p-4 md:p-6 flex-shrink-0 ${
        isInputFocused ? 'pb-2 sm:pb-4 md:pb-6' : 'pb-16 sm:pb-4 md:pb-6'
      }`}>
        {/* Gemini Working Status - positioned above the input form */}
        <GeminiStatus
          status={geminiStatus}
          isLoading={isLoading}
          onAbort={handleAbortSession}
        />

        {/* Gemini Mode Indicator - Above input */}
        <div className="max-w-4xl mx-auto mb-3">
          <div className="flex items-center justify-center gap-3">
            <div className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
              isYoloMode
                ? 'bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600'
                : 'bg-linear-to-r from-cyan-50 to-gemini-50 dark:from-cyan-900/20 dark:to-gemini-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isYoloMode ? 'bg-orange-500' : 'bg-cyan-500'}`} />
                <span>{isYoloMode ? 'Gemini YOLO' : 'Gemini Default'}</span>
                <span className="text-xs opacity-75">• {selectedModel}</span>
              </div>
            </div>

            {/* Scroll to bottom button - positioned next to mode indicator */}
            {isUserScrolledUp && chatMessages.length > 0 && (
              <button
                onClick={scrollToBottom}
                className="w-8 h-8 bg-gemini-600 hover:bg-gemini-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gemini-500 focus:ring-offset-2 dark:ring-offset-gray-800"
                title="Scroll to bottom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          {/* Drag overlay */}
          {isDragActive && (
            <div className="absolute inset-0 bg-gemini-700/20 border-2 border-dashed border-gemini-300 rounded-lg flex items-center justify-center z-50">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-lg">
                <svg className="w-8 h-8 text-gemini-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium">Drop images here</p>
              </div>
            </div>
          )}
          
          {/* Image attachments preview */}
          {attachedImages.length > 0 && (
            <div className="mb-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {attachedImages.map((file, index) => (
                  <ImageAttachment
                    key={index}
                    file={file}
                    onRemove={() => {
                      setAttachedImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    uploadProgress={uploadingImages.get(file.name)}
                    error={imageErrors.get(file.name)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* File dropdown - positioned outside dropzone to avoid conflicts */}
          {showFileDropdown && filteredFiles.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 backdrop-blur-sm">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.type === 'category' ? file.category : file.path}
                  className={`px-4 py-3 cursor-pointer border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 touch-manipulation ${
                    index === selectedFileIndex
                      ? 'bg-gemini-50 dark:bg-gemini-900/20 text-gemini-700 dark:text-gemini-300'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                  onMouseDown={(e) => {
                    // Prevent textarea from losing focus on mobile
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectFile(file);
                  }}
                >
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {file.path}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCommandMenu && filteredCommands.length > 0 && (
            <CommandMenu
              commands={filteredCommands}
              onSelect={selectCommand}
              selectedIndex={selectedCommandIndex}
            />
          )}

          <div {...getRootProps()} className={`chat-input-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-gemini-500 dark:focus-within:ring-gemini-500 focus-within:border-gemini-500 transition-all duration-200 ${isTextareaExpanded ? 'chat-input-expanded' : ''}`}>
            <input {...getInputProps()} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onClick={handleTextareaClick}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onInput={(e) => {
                // Immediate resize on input for better UX
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                setCursorPosition(e.target.selectionStart);

                // Check if textarea is expanded (more than 2 lines worth of height)
                const lineHeight = parseInt(window.getComputedStyle(e.target).lineHeight);
                const isExpanded = e.target.scrollHeight > lineHeight * 2;
                setIsTextareaExpanded(isExpanded);
              }}
              placeholder="Ask Gemini to help with your code... (@ to reference files)"
              disabled={isLoading}
              rows={1}
              className="chat-input-placeholder w-full pl-12 pr-28 sm:pr-40 py-3 sm:py-4 bg-transparent rounded-2xl focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-400 disabled:opacity-50 resize-none min-h-[40px] sm:min-h-[56px] max-h-[40vh] sm:max-h-[300px] overflow-y-auto text-sm sm:text-base transition-all duration-200"
              style={{ height: 'auto' }}
            />
            {/* Clear button - shown when there's text */}
            {input.trim() && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInput('');
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.focus();
                  }
                  setIsTextareaExpanded(false);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInput('');
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.focus();
                  }
                  setIsTextareaExpanded(false);
                }}
                className="absolute -left-0.5 -top-3 sm:right-28 sm:left-auto sm:top-1/2 sm:-translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center transition-all duration-200 group z-10 shadow-sm"
                title="Clear input"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors" 
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {/* Image upload button */}
            <button
              type="button"
              onClick={open}
              className="absolute left-2 bottom-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Attach images"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Mic button - HIDDEN */}
            <div className="absolute right-16 sm:right-16 top-1/2 transform -translate-y-1/2" style={{ display: 'none' }}>
              <MicButton
                onTranscript={handleTranscript}
                className="w-10 h-10 sm:w-10 sm:h-10"
              />
            </div>
            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="absolute right-2 top-1/3 transform -translate-y-1/2 w-12 h-12 sm:w-12 sm:h-12 bg-gemini-500 hover:bg-gemini-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gemini-500 focus:ring-offset-2 dark:ring-offset-gray-800"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white transform rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          {/* Hint text */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block">
            Press Enter to send • Shift+Enter for new line • Tab to change modes • @ to reference files
          </div>
          <div className={`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200 ${
            isInputFocused ? 'opacity-100' : 'opacity-0'
          }`}>
            Enter to send • Tab for modes • @ for files
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default React.memo(ChatInterface);