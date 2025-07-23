import React, { useState, useEffect } from 'react';
import { Brain, Zap, Search, Code, FileText, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const ThinkingIndicator = ({ 
  isThinking = false, 
  currentThought = '', 
  toolCalls = [], 
  thoughts = [],
  className = '' 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    thoughts: true,
    tools: true
  });
  const [animationPhase, setAnimationPhase] = useState(0);

  // Thinking animation
  useEffect(() => {
    if (!isThinking) {
      return;
    }

    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(timer);
  }, [isThinking]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getToolIcon = (toolName) => {
    const name = toolName?.toLowerCase() || '';
    if (name.includes('search') || name.includes('web')) {
      return Search;
    }
    if (name.includes('code') || name.includes('write') || name.includes('edit')) {
      return Code;
    }
    if (name.includes('file') || name.includes('read')) {
      return FileText;
    }
    return Zap;
  };

  const formatThought = (thought) => {
    if (typeof thought === 'string') {
      return thought;
    }
    return thought?.content || thought?.text || JSON.stringify(thought);
  };

  const formatToolCall = (tool) => {
    if (typeof tool === 'string') {
      return { name: tool, status: 'completed' };
    }
    return {
      name: tool?.name || tool?.function?.name || 'Unknown Tool',
      status: tool?.status || 'completed',
      result: tool?.result || tool?.output,
      parameters: tool?.parameters || tool?.function?.arguments
    };
  };

  if (!isThinking && thoughts.length === 0 && toolCalls.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${isThinking ? 'scale-110' : ''}`}>
              <Brain className={`w-5 h-5 text-white ${isThinking ? 'animate-pulse' : ''}`} />
            </div>
            {isThinking && (
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-20 animate-ping" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              AI Thinking Process
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isThinking ? 'Processing your request...' : 'Analysis complete'}
            </p>
          </div>

          {isThinking && (
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 bg-blue-500 rounded-full transition-all duration-300 ${
                    animationPhase === i ? 'scale-125 opacity-100' : 'scale-75 opacity-40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Thinking */}
      {isThinking && currentThought && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Thought
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentThought}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {/* Tool Calls Section */}
        {toolCalls.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('tools')}
              className="flex items-center justify-between w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tool Calls ({toolCalls.length})
                </span>
              </div>
              {expandedSections.tools ? (
                <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              )}
            </button>

            {expandedSections.tools && (
              <div className="mt-3 space-y-3">
                {toolCalls.map((tool, index) => {
                  const formattedTool = formatToolCall(tool);
                  const ToolIcon = getToolIcon(formattedTool.name);

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formattedTool.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : formattedTool.status === 'error'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          <ToolIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {formattedTool.name}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              formattedTool.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : formattedTool.status === 'error'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            }`}>
                              {formattedTool.status}
                            </span>
                          </div>

                          {formattedTool.parameters && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono bg-slate-50 dark:bg-slate-900 rounded px-2 py-1">
                              {typeof formattedTool.parameters === 'string'
                                ? formattedTool.parameters
                                : JSON.stringify(formattedTool.parameters, null, 2)}
                            </div>
                          )}

                          {formattedTool.result && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {typeof formattedTool.result === 'string'
                                ? formattedTool.result.substring(0, 200) + (formattedTool.result.length > 200 ? '...' : '')
                                : JSON.stringify(formattedTool.result).substring(0, 200) + '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Thoughts Section */}
        {thoughts.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('thoughts')}
              className="flex items-center justify-between w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Reasoning Steps ({thoughts.length})
                </span>
              </div>
              {expandedSections.thoughts ? (
                <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              )}
            </button>

            {expandedSections.thoughts && (
              <div className="mt-3 space-y-2">
                {thoughts.map((thought, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                        {formatThought(thought)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isThinking && (thoughts.length > 0 || toolCalls.length > 0) && (
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Analysis completed</span>
            <span>{toolCalls.length} tools • {thoughts.length} steps</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingIndicator;
