import React, { useState, useEffect } from 'react';
import { Clock, Brain, CheckCircle2, Eye, Sparkles } from 'lucide-react';

const ProgressIndicator = ({
  currentStage,
  isLoading,
  loadingStates,
  onStageClick,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [glowPhase, setGlowPhase] = useState(0);

  const stages = [
    {
      id: 'input',
      label: 'Input',
      icon: Brain,
      color: 'from-violet-500 via-purple-500 to-indigo-600',
      description: 'Define requirements'
    },
    {
      id: 'generating',
      label: 'Generate',
      icon: Sparkles,
      color: 'from-blue-500 via-cyan-500 to-teal-600',
      description: 'AI processing'
    },
    {
      id: 'review',
      label: 'Review',
      icon: Eye,
      color: 'from-emerald-500 via-green-500 to-lime-600',
      description: 'Final review'
    }
  ];

  // Timer for current loading operation
  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  // Pulse animation
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 3);
    }, 600);

    return () => clearInterval(timer);
  }, [isLoading]);

  // Glow animation
  useEffect(() => {
    const timer = setInterval(() => {
      setGlowPhase(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const getCurrentStageIndex = () => stages.findIndex(s => s.id === currentStage);
  const currentIndex = getCurrentStageIndex();
  const progress = ((currentIndex + 1) / stages.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative overflow-hidden bg-linear-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-sm ${className}`}>
      {/* Animated background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `conic-gradient(from ${glowPhase}deg, transparent, rgba(59, 130, 246, 0.1), transparent)`
        }}
      />

      {/* Header with timer */}
      <div className="relative px-8 py-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-gemini-400 via-gemini-600 to-gemini-800 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {isLoading && (
                <>
                  <div className="absolute -inset-2 bg-linear-to-br from-gemini-400 via-gemini-600 to-gemini-800 rounded-2xl opacity-20 animate-ping" />
                  <div className="absolute -inset-1 bg-linear-to-br from-gemini-400 via-gemini-600 to-gemini-800 rounded-2xl opacity-40 animate-pulse" />
                </>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold bg-linear-to-r from-slate-900 via-gemini-700 to-slate-900 dark:from-white dark:via-gemini-300 dark:to-white bg-clip-text text-transparent">
                Specification Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {isLoading ? 'AI is crafting your specification...' : 'Ready to generate'}
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-3 bg-linear-to-r from-gemini-400 to-gemini-600 dark:from-gemini-900/30 dark:to-gemini-900/30 px-4 py-2 rounded-xl border border-gemini-200 dark:border-gemini-800">
              <Clock className="w-4 h-4 text-gemini-600 dark:text-gemini-400" />
              <span className="text-sm font-mono font-semibold text-gemini-700 dark:text-gemini-300">
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative px-8 py-6">
        <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
          <span>Overall Progress</span>
          <span className="text-gemini-600 dark:text-gemini-400">{Math.round(progress)}%</span>
        </div>

        <div className="relative">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="h-full bg-linear-to-r from-gemini-400 via-gemini-600 to-gemini-800 rounded-full transition-all duration-1000 ease-out relative shadow-lg"
              style={{ width: `${progress}%` }}
            >
              {isLoading && (
                <>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-pulse rounded-full" />
                  <div className="absolute inset-0 bg-linear-to-r from-gemini-400 to-gemini-600 rounded-full animate-pulse opacity-60" />
                </>
              )}
            </div>
          </div>

          {/* Progress glow effect */}
          {progress > 0 && (
            <div
              className="absolute top-0 h-3 bg-linear-to-r from-gemini-400 via-gemini-600 to-gemini-800 rounded-full opacity-30 blur-sm transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      </div>

      {/* Stage indicators */}
      <div className="relative px-8 pb-8">
        <div className="grid grid-cols-3 gap-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stage.id === currentStage;
            const isCompleted = index < currentIndex;
            const isCurrentlyLoading = isActive && (isLoading || loadingStates?.[stage.id]);

            return (
              <div key={stage.id} className="relative">
                {/* Connection line */}
                {index < stages.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div
                        className={`h-full bg-linear-to-r from-gemini-400 to-gemini-600 rounded-full transition-all duration-1000 ease-out ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onStageClick?.(stage.id)}
                  disabled={index > currentIndex + 1}
                  className={`
                    relative w-full p-6 rounded-2xl border transition-all duration-500 group z-10
                    ${isActive
                      ? 'border-gemini-300 dark:border-gemini-600 bg-linear-to-br from-gemini-400 via-gemini-600 to-gemini-800 dark:from-gemini-900/30 dark:via-gemini-900/30 dark:to-gemini-900/30 shadow-xl shadow-gemini-500/20'
                      : isCompleted
                      ? 'border-emerald-300 dark:border-emerald-600 bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                    ${index <= currentIndex + 1 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  {/* Animated background for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-br from-gemini-400/5 via-gemini-600/5 to-gemini-800/5 rounded-2xl animate-pulse" />
                  )}

                  {/* Icon container */}
                  <div className="relative flex flex-col items-center">
                    <div className={`
                      relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 mb-4
                      ${isActive
                        ? `bg-linear-to-br ${stage.color} text-white shadow-lg shadow-gemini-500/30`
                        : isCompleted
                        ? 'bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }
                      ${isCurrentlyLoading ? 'animate-pulse scale-110' : ''}
                    `}>
                      {/* Glow effect for active state */}
                      {isActive && (
                        <div className="absolute -inset-2 bg-linear-to-br from-gemini-400 via-gemini-600 to-gemini-800 rounded-2xl opacity-20 animate-ping" />
                      )}

                      <Icon className={`w-8 h-8 ${isCurrentlyLoading ? 'animate-spin' : ''}`} />

                      {/* Completion checkmark overlay */}
                      {isCompleted && !isActive && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Stage info */}
                    <div className="text-center">
                      <h4 className={`
                        text-lg font-bold transition-colors duration-300 mb-1
                        ${isActive
                          ? 'text-gemini-700 dark:text-gemini-300'
                          : isCompleted
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-slate-400'
                        }
                      `}>
                        {stage.label}
                      </h4>

                      <p className={`
                        text-sm transition-colors duration-300
                        ${isActive
                          ? 'text-gemini-800 dark:text-gemini-200'
                          : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-500'
                        }
                      `}>
                        {stage.description}
                      </p>

                      {/* Status indicator */}
                      <div className="mt-3 flex justify-center">
                        {isCurrentlyLoading ? (
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 bg-gemini-500 rounded-full transition-all duration-300 ${
                                  pulsePhase === i ? 'opacity-100 scale-125' : 'opacity-40 scale-75'
                                }`}
                              />
                            ))}
                          </div>
                        ) : isCompleted ? (
                          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                        ) : isActive ? (
                          <div className="w-3 h-3 bg-gemini-500 rounded-full animate-pulse shadow-lg shadow-gemini-500/50" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current stage info */}
      {isLoading && (
        <div className="mt-4 p-3 bg-linear-to-r from-gemini-50 to-blue-50 dark:from-gemini-900/20 dark:to-blue-900/20 rounded-lg border border-gemini-200 dark:border-gemini-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gemini-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gemini-700 dark:text-gemini-300">
              Generating {stages[currentIndex]?.label.toLowerCase()}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;