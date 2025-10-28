import React, { useState, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SourceFile {
  path: string;
  content: string;
}

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFiles: SourceFile[];
}

const getLanguage = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'tsx':
      return 'tsx';
    case 'ts':
      return 'typescript';
    case 'jsx':
      return 'jsx';
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'typescript';
  }
};

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
  isOpen,
  onClose,
  sourceFiles
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const deferredFileIndex = useDeferredValue(selectedFileIndex);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const isLoading = selectedFileIndex !== deferredFileIndex;
  const displayedFile = sourceFiles[deferredFileIndex];

  const handleCopy = async () => {
    if (displayedFile) {
      await navigator.clipboard.writeText(displayedFile.content);
      setCopiedIndex(deferredFileIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const getRelativePath = (path: string) => {
    // Extract the path relative to the prototype directory
    // e.g., "src/pages/prototypes/nerselection/images/menu-item.svg" -> "images/menu-item.svg"
    const parts = path.split('/');
    const prototypesIndex = parts.indexOf('prototypes');
    if (prototypesIndex >= 0 && prototypesIndex + 2 < parts.length) {
      // Return everything after the prototype name directory
      return parts.slice(prototypesIndex + 2).join('/');
    }
    return getFileName(path);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* File list sidebar */}
          {sourceFiles.length > 1 && (
            <div className="w-64 border-r border-border overflow-y-auto bg-muted/50">
              <div className="p-2">
                {sourceFiles.map((file, index) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm text-foreground transition-colors font-mono truncate ${
                      selectedFileIndex === index && 'bg-hover font-medium'
                    }`}
                  >
                    {getRelativePath(file.path)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code viewer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File path and action buttons */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-sm text-muted-foreground font-mono">
                {displayedFile?.path}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex text-foreground items-center gap-2 px-3 h-8 rounded-md bg-background hover:bg-hover transition-colors border border-border text-sm"
                >
                  {copiedIndex === deferredFileIndex ? (
                    <>
                      <Check size={16} className="text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="h-8 px-2 rounded-md hover:bg-hover transition-colors border border-border"
                  aria-label="Close modal"
                >
                  <X size={16} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <SyntaxHighlighter
                  language={getLanguage(displayedFile?.path || '')}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.875rem',
                    height: '100%',
                  }}
                >
                  {displayedFile?.content || ''}
                </SyntaxHighlighter>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
