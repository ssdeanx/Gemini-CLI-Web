import React, { useMemo, useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

/**
 * ToolUseFeedback
 * Pure presentational component to render a single tool-use message inline in chat.
 *
 * Props:
 * - message: {
 *     isToolUse: true,
 *     toolName: string,
 *     toolInput?: string,                // JSON string typically
 *     toolResult?: string | object,      // may be string or structured object
 *     toolError?: boolean,
 *     toolResultTimestamp?: string|Date
 *   }
 * - autoExpandTools: boolean
 * - showRawParameters: boolean
 * - onFileOpen?: (filePath: string) => void
 * - onShowSettings?: () => void
 * - maxPreviewChars?: number
 * - className?: string
 */
function ToolUseFeedback({
  message,
  autoExpandTools = false,
  showRawParameters = false,
  onFileOpen,
  onShowSettings,
  maxPreviewChars = 500,
  className = "",
}) {
  const {
    toolName = "Tool",
    toolInput,
    toolResult,
    toolError = false,
    toolResultTimestamp,
  } = message || {};

  // Safely parse tool input JSON if possible
  const parsedInput = useMemo(() => {
    if (!toolInput || typeof toolInput !== "string") return null;
    try {
      return JSON.parse(toolInput);
    } catch {
      return null;
    }
  }, [toolInput]);

  // Helper to stringify small JSON safely
  const toPreviewString = (val) => {
    try {
      if (typeof val === "string") return val;
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val ?? "");
    }
  };

  // Build result preview
  const resultString = useMemo(() => toPreviewString(toolResult), [toolResult]);

  const isLong = resultString && resultString.length > maxPreviewChars;
  const preview = isLong ? resultString.slice(0, maxPreviewChars) + "…" : resultString;

  const [detailsOpen, setDetailsOpen] = useState(autoExpandTools);

  const headerIcon = (() => {
    const base = "w-5 h-5";
    if (toolError) {
      return (
        <svg className={`${base} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
        </svg>
      );
    }
    // Success/default
    return (
      <svg className={`${base} text-gemini-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  })();

  const timestampText = (() => {
    try {
      const d = toolResultTimestamp ? new Date(toolResultTimestamp) : new Date();
      return d.toLocaleTimeString();
    } catch {
      return "";
    }
  })();

  // Specialized render helpers

  const renderBash = () => {
    const cmd = parsedInput?.cmd || parsedInput?.command || "";
    return (
      <div className="space-y-2">
        {cmd ? (
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Command
            <pre className="mt-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 overflow-auto">
              <code>{cmd}</code>
            </pre>
          </div>
        ) : null}
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderRead = () => {
    // Expecting path in input
    const path = parsedInput?.path || parsedInput?.file || parsedInput?.filepath || null;
    return (
      <div className="space-y-2">
        {path ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-xs">📖 Read</Badge>
            <span className="text-sm font-mono break-all">{path}</span>
            {onFileOpen ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFileOpen(path)}
                className="h-7 px-2"
                title="Open file"
              >
                Open
              </Button>
            ) : null}
          </div>
        ) : null}
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderWriteReplaceEdit = (label) => {
    const path = parsedInput?.path || parsedInput?.file || parsedInput?.filepath || null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">✓ {label}</Badge>
          {path ? <span className="text-sm font-mono break-all">{path}</span> : null}
          {path && onFileOpen ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileOpen(path)}
              className="h-7 px-2"
              title="Open file"
            >
              Open
            </Button>
          ) : null}
        </div>
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderTodoWrite = () => {
    // show compact preview of todos if present
    const todos = parsedInput?.todos;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200">
            📝 TodoWrite
          </Badge>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Updated todo list</span>
        </div>
        {Array.isArray(todos) && todos.length > 0 ? (
          <div className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40">
            <ScrollArea className="max-h-40 p-2">
              <ul className="text-sm list-disc pl-5 space-y-1">
                {todos.slice(0, 10).map((t, idx) => (
                  <li key={idx} className="break-words">{typeof t === "string" ? t : toPreviewString(t)}</li>
                ))}
                {todos.length > 10 ? (
                  <li className="italic text-zinc-500 dark:text-zinc-400">…and {todos.length - 10} more</li>
                ) : null}
              </ul>
            </ScrollArea>
          </div>
        ) : null}
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderTodoRead = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200">
            📋 TodoRead
          </Badge>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Read todo list</span>
        </div>
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderWebTool = (label) => {
    const url = parsedInput?.url || parsedInput?.href || parsedInput?.query || null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-200">
            🌐 {label}
          </Badge>
          {url ? <span className="text-sm break-all">{String(url)}</span> : null}
        </div>
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderPlanExit = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-600 text-white">🧭 Plan</Badge>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Implementation plan</span>
        </div>
        {resultString ? renderResultBlock(preview, isLong) : null}
      </div>
    );
  };

  const renderGeneric = () => {
    return (
      <div className="space-y-2">
        {resultString ? renderResultBlock(preview, isLong) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 italic">No output</div>
        )}
      </div>
    );
  };

  // Common result renderer with collapsible details if long or on error
  function renderResultBlock(previewText, long) {
    if (toolError) {
      return (
        <div className="rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <div className="px-3 py-2 text-sm text-red-800 dark:text-red-200 font-medium">Error</div>
          <div className="px-3 pb-3">
            {long ? (
              <details open={detailsOpen} onToggle={(e) => setDetailsOpen(e.currentTarget.open)}>
                <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300 select-none">View full error</summary>
                <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2 overflow-auto">
                  <code>{resultString}</code>
                </pre>
              </details>
            ) : (
              <pre className="text-xs bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2 overflow-auto">
                <code>{previewText}</code>
              </pre>
            )}
          </div>
        </div>
      );
    }

    if (long) {
      return (
        <details open={detailsOpen} onToggle={(e) => setDetailsOpen(e.currentTarget.open)} className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30">
          <summary className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 px-3 py-2 select-none">View full output</summary>
          <div className="px-3 pb-3">
            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 overflow-auto">
              <code>{resultString}</code>
            </pre>
          </div>
        </details>
      );
    }

    return (
      <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 overflow-auto">
        <code>{previewText}</code>
      </pre>
    );
  }

  // Header + parameters
  const renderHeader = () => {
    return (
      <div className="flex items-center gap-2">
        {headerIcon}
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{toolName}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{timestampText}</div>
        {onShowSettings ? (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2 text-xs"
            onClick={onShowSettings}
            title="Open settings"
          >
            Settings
          </Button>
        ) : null}
      </div>
    );
  };

  const renderParams = () => {
    if (!showRawParameters) return null;
    const raw = toolInput || (parsedInput ? JSON.stringify(parsedInput, null, 2) : "");
    if (!raw) return null;

    return (
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300 select-none">View input parameters</summary>
        <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 overflow-auto">
          <code>{raw}</code>
        </pre>
      </details>
    );
  };

  const toolLower = String(toolName || "").toLowerCase();

  let body = null;
  if (toolLower.startsWith("bash")) {
    body = renderBash();
  } else if (toolLower === "read" || toolLower === "read_file" || toolLower === "readfile") {
    body = renderRead();
  } else if (toolLower === "replace") {
    body = renderWriteReplaceEdit("Replace");
  } else if (toolLower === "write") {
    body = renderWriteReplaceEdit("Write");
  } else if (toolLower === "edit" || toolLower === "multiedit") {
    body = renderWriteReplaceEdit(toolName);
  } else if (toolLower === "todowrite") {
    body = renderTodoWrite();
  } else if (toolLower === "todoread") {
    body = renderTodoRead();
  } else if (toolLower === "webfetch") {
    body = renderWebTool("WebFetch");
  } else if (toolLower === "websearch") {
    body = renderWebTool("WebSearch");
  } else if (toolLower === "exit_plan_mode" || toolLower === "exit-plan-mode" || toolLower === "exit plan mode") {
    body = renderPlanExit();
  } else if (toolLower === "glob" || toolLower === "grep" || toolLower === "task" || toolLower === "readmanyfiles") {
    body = renderGeneric();
  } else {
    body = renderGeneric();
  }

  return (
    <div className={`rounded-lg border ${toolError ? "border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"} p-3 sm:p-4 ${className}`}>
      {renderHeader()}
      {renderParams()}
      <div className="mt-3">{body}</div>
    </div>
  );
}

export default React.memo(ToolUseFeedback);
