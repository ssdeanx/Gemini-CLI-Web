import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';
import { X, Save, Download } from 'lucide-react';

function NewCodeEditor({ file, onClose, initialContent, hideCloseButton = false, onContentChange, onSave }) {
  const [content, setContent] = useState(initialContent || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDarkMode } = useTheme();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [originalContent, setOriginalContent] = useState(''); // Track original content for modified state
  const [isModified, setIsModified] = useState(false);
  const editorRef = useRef(null); // Ref for Monaco editor instance

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        setLoading(true);
        const response = await api.readFile(file.projectName, file.path);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setContent(data.content);
        setOriginalContent(data.content);
        setIsModified(false);
      } catch (error) {
        const errorContent = `// Error loading file: ${error.message}\n// Please check if the file exists and you have permission to read it.`;
        setContent(errorContent);
        setOriginalContent(errorContent);
        setIsModified(false);
        // Show user-friendly error notification
        alert(`Failed to load file "${file.name}": ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (file) {
        loadFileContent();
    }
  }, [file]); // Removed projectPath from dependency array

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      setOriginalContent(initialContent);
      setIsModified(false);
    }
  }, [initialContent]);

  // Handle content changes and track modified state
  const handleContentChange = (newContent) => {
    setContent(newContent || '');
    const modified = (newContent || '') !== originalContent;
    setIsModified(modified);

    // Notify parent of content change
    if (onContentChange) {
      onContentChange(newContent || '', modified);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.saveFile(file.projectName, file.path, content);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Save failed: ${response.status}`);
      }
      // Update original content and reset modified state after successful save
      setOriginalContent(content);
      setIsModified(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Notify parent of successful save
      if (onSave) {
        onSave(file.id, content, false); // false = not modified after save
      }
    } catch (error) {
      alert(`Failed to save "${file.name}": ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [content]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-800 w-full h-full">
      <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {file.name}
          {isModified && (
            <span className="w-2 h-2 bg-gemini-500 rounded-full" title="Unsaved changes" />
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-2 rounded transition-all duration-200 ${
              saveSuccess
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : saving
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
            title={saveSuccess ? 'Saved successfully!' : saving ? 'Saving...' : 'Save file (Ctrl+S)'}
          >
            {saving ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Saving...</span>
              </div>
            ) : saveSuccess ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 text-green-600 dark:text-green-400">✓</div>
                <span className="text-xs">Saved</span>
              </div>
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
          <button onClick={handleDownload} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">
            <Download className="w-5 h-5" />
          </button>
          {!hideCloseButton && (
            <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={content}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          onChange={handleContentChange}
          onMount={(editor) => (editorRef.current = editor)} // Assign editor instance to ref
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}

export default NewCodeEditor;