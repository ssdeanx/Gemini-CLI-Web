import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

function ImageViewer({ file, onClose }) {
  const imagePath = `/api/projects/${file.projectName}/files/content?path=${encodeURIComponent(file.path)}`;

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50 glass-morphism-dark">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-elevated max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden glass-morphism dark:glass-morphism-dark">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {file.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 flex justify-center items-center bg-zinc-50 dark:bg-zinc-900 min-h-[400px] neumorphic-inset dark:neumorphic-inset-dark">
          <img
            src={imagePath}
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-layered glow-soft"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div
            className="text-center text-zinc-500 dark:text-zinc-400"
            style={{ display: 'none' }}
          >
            <p>Unable to load image</p>
            <p className="text-sm mt-2">{file.path}</p>
          </div>
        </div>

        <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {file.path}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImageViewer;