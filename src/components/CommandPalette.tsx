import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ComponentType } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, ArrowRight } from 'lucide-react';

type PrototypeRoute = {
  path: string;
  title: string;
  module: () => Promise<{ default: ComponentType }>;
  sourceFiles: Array<{ path: string; content: string }>;
};

interface CommandPaletteProps {
  prototypes: PrototypeRoute[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ prototypes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? prototypes.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    : prototypes;

  const currentPath = location.pathname;

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-item]');
    items[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const selectItem = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) selectItem(filtered[activeIndex].path);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
          />
          <Dialog.Content
            className="fixed z-[201] top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg outline-none"
            onKeyDown={handleKeyDown}
            aria-label="Prototype switcher"
          >
            <Dialog.Title className="sr-only">Switch prototype</Dialog.Title>
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{ background: '#fff', border: '1px solid #e2e8f0' }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search prototypes…"
                  className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-slate-400"
                  style={{ color: '#0f172a' }}
                />
                <kbd
                  className="text-[11px] px-1.5 py-0.5 rounded border font-mono"
                  style={{ color: '#94a3b8', borderColor: '#e2e8f0', background: '#f8fafc' }}
                >
                  esc
                </kbd>
              </div>

              {/* Results list */}
              <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 360 }}>
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                    No prototypes found
                  </div>
                ) : (
                  <div className="py-1.5">
                    {filtered.map((p, i) => {
                      const isActive = i === activeIndex;
                      const isCurrent = p.path === currentPath;
                      return (
                        <button
                          key={p.path}
                          data-item
                          onClick={() => selectItem(p.path)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                          style={{
                            background: isActive ? '#f1f5f9' : 'transparent',
                            color: isCurrent ? '#2563eb' : '#0f172a',
                          }}
                        >
                          <span className="font-medium">{p.title}</span>
                          {isActive && (
                            <ArrowRight size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          )}
                          {!isActive && isCurrent && (
                            <span
                              className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                              style={{ background: '#dbeafe', color: '#2563eb' }}
                            >
                              current
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div
                className="flex items-center gap-4 px-4 py-2.5 text-[11px] border-t"
                style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}
              >
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↑</kbd>
                  <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↵</kbd>
                  open
                </span>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default CommandPalette;
