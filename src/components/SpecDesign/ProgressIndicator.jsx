import React, { useState, useEffect } from 'react';
import { Clock, Zap, Brain, CheckCircle2 } from 'lucide-react';

const ProgressIndicator = ({
  currentStage,
  isLoading,
  loadingStates,
  onStageClick
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  const stages = [
    { id: 'design', label: 'Design', icon: Brain, color: 'from-purple-500 to-indigo-600' },
    { id: 'requirements', label: 'Requirements', icon: Zap, color: 'from-blue-500 to-cyan-600' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { id: 'review', label: 'Review', icon: CheckCircle2, color: 'from-amber-500 to-orange-600' }
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

  const getCurrentStageIndex = () => stages.findIndex(s => s.id === currentStage);
  const currentIndex = getCurrentStageIndex();
  const progress = ((currentIndex + 1) / stages.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
      {/* Header with timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gemini-500 to-gemini-600 rounded-lg flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Spec Generation Progress
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Generating...' : 'Ready to proceed'}
            </p>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-gemini-500" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gemini-500 to-gemini-600 rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="grid grid-cols-4 gap-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.id === currentStage;
          const isCompleted = index < currentIndex;
          const isCurrentlyLoading = isActive && loadingStates[stage.id];
          
          return (
            <button
              key={stage.id}
              onClick={() => onStageClick?.(stage.id)}
              disabled={index > currentIndex + 1}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 group
                ${isActive 
                  ? 'border-gemini-500 bg-gemini-50 dark:bg-gemini-900/20 shadow-md' 
                  : isCompleted
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }
                ${index <= currentIndex + 1 ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
              `}
            >
              {/* Loading overlay */}
              {isCurrentlyLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gemini-500/10 to-gemini-600/10 rounded-xl animate-pulse" />
              )}
              
              {/* Icon with dynamic effects */}
              <div className={`
                w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center transition-all duration-300
                ${isActive 
                  ? `bg-gradient-to-br ${stage.color} text-white shadow-lg` 
                  : isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
                ${isCurrentlyLoading ? 'animate-pulse scale-110' : ''}
              `}>
                <Icon className={`w-4 h-4 ${isCurrentlyLoading ? 'animate-spin' : ''}`} />
              </div>
              
              {/* Stage label */}
              <div className="text-center">
                <p className={`
                  text-xs font-medium transition-colors duration-300
                  ${isActive 
                    ? 'text-gemini-700 dark:text-gemini-300' 
                    : isCompleted
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {stage.label}
                </p>
                
                {/* Status indicator */}
                <div className="mt-1">
                  {isCurrentlyLoading ? (
                    <div className="flex justify-center">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 bg-gemini-500 rounded-full transition-opacity duration-300 ${
                              pulsePhase === i ? 'opacity-100' : 'opacity-30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : isCompleted ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-gemini-500 rounded-full mx-auto animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
                  )}
                </div>
              </div>
              
              {/* Completion checkmark */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current stage info */}
      {isLoading && (
        <div className="mt-4 p-3 bg-gradient-to-r from-gemini-50 to-blue-50 dark:from-gemini-900/20 dark:to-blue-900/20 rounded-lg border border-gemini-200 dark:border-gemini-800">
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