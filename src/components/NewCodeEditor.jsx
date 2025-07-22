import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';
import { X, Save, Download } from 'lucide-react';

function NewCodeEditor({ file, onClose, initialContent }) {
  const [content, setContent] = useState(initialContent || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDarkMode } = useTheme();
  const [saveSuccess, setSaveSuccess] = useState(false);
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
      } catch (error) {
        console.error('Error loading file:', error);
        setContent(`// Error loading file: ${error.message}`);
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
        setContent(initialContent)
    }
  }, [initialContent])

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.saveFile(file.projectName, file.path, content);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Save failed: ${response.status}`);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving file:', error);
      alert(`Error saving file: ${error.message}`);
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
    <div className="flex flex-col bg-white dark:bg-gray-800 w-full h-full">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">{file.name}</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handleSave} disabled={saving} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            {saving ? 'Saving...' : <Save className="w-5 h-5" />}
          </button>
          <button onClick={handleDownload} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={content}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          onChange={(value) => setContent(value || '')}
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