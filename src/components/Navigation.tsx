import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ComponentType } from 'react';
import { Moon, Sun, Code, Settings, X } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { useConfig, ConfigControls } from '../lib/config';
import { SourceCodeModal } from './SourceCodeModal';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type PrototypeRoute = {
  path: string;
  title: string;
  module: () => Promise<{ default: ComponentType }>;
  sourceFiles: Array<{ path: string; content: string }>;
};

interface NavigationProps {
  prototypes?: PrototypeRoute[];
}

const Navigation: React.FC<NavigationProps> = ({ prototypes = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { configs } = useConfig();
  const [selectedPrototype, setSelectedPrototype] = useState('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-select first prototype if none selected and prototypes are loaded
  useEffect(() => {
    if (prototypes.length > 0) {
      if (location.pathname === '/') {
        // Auto-navigate to first prototype if on home page
        setSelectedPrototype(prototypes[0].path);
        navigate(prototypes[0].path);
      } else {
        // Otherwise, set selected prototype based on current path
        setSelectedPrototype(location.pathname);
      }
    }
  }, [location.pathname, prototypes, navigate]);

  const handlePrototypeChange = (value: string) => {
    if (value) {
      setSelectedPrototype(value);
      navigate(value);
    }
  };

  // Find the config for the currently selected prototype
  const currentConfig = configs.find(config =>
    selectedPrototype && selectedPrototype.includes(config.prototypeId)
  );

  // Find the current prototype data
  const currentPrototype = prototypes.find(p => p.path === selectedPrototype);

  const handleViewSource = () => {
    if (currentPrototype) {
      setIsSourceModalOpen(true);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 bg-muted fixed left-0 top-0 shadow-md overflow-y-auto theme-transition border-r border-border flex-col">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Prototypes</h2>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-background hover:bg-hover theme-transition border border-border"
              aria-label="Toggle theme"
              title={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme.mode === 'light' ? (
                <Moon size={16} className="text-foreground" />
              ) : (
                <Sun size={16} className="text-foreground" />
              )}
            </button>
          </div>

          {prototypes.length === 0 ? (
            <div className="text-muted-foreground">Loading prototypes...</div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Select value={selectedPrototype} onValueChange={handlePrototypeChange}>
                  <SelectTrigger className="w-full bg-background border-border hover:border-input text-foreground">
                    <SelectValue placeholder="Select a prototype" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {prototypes.map((prototype) => (
                      <SelectItem
                        key={prototype.path}
                        value={prototype.path}
                        className="text-popover-foreground hover:bg-hover focus:bg-hover"
                      >
                        {prototype.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={handleViewSource}
                className="w-full px-3 py-2 rounded-md bg-background hover:bg-hover theme-transition border border-border disabled:opacity-50 disabled:cursor-not-allowed text-sm text-foreground flex items-center justify-center gap-2"
                disabled={!selectedPrototype}
              >
                <Code size={16} />
                View source
              </button>
            </div>
          )}
        </div>

        {/* Flush divider */}
        {currentConfig && <div className="border-t border-border" />}

        {/* Show configuration controls for the current prototype */}
        {currentConfig && (
          <div className="px-4 py-4">
            <ConfigControls
              prototypeId={currentConfig.prototypeId}
              controls={currentConfig.controls}
            />
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-screen bg-muted border-b border-border shadow-md z-50 theme-transition overflow-x-hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Select value={selectedPrototype} onValueChange={handlePrototypeChange}>
              <SelectTrigger className="w-full bg-background border-border hover:border-input text-foreground">
                <SelectValue placeholder="Select a prototype" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {prototypes.map((prototype) => (
                  <SelectItem
                    key={prototype.path}
                    value={prototype.path}
                    className="text-popover-foreground hover:bg-hover focus:bg-hover"
                  >
                    {prototype.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <Dialog.Trigger asChild>
              <button
                className="p-2 rounded-md bg-background hover:bg-hover theme-transition border border-border"
                aria-label="Settings"
              >
                <Settings size={20} className="text-foreground" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed max-w-[100vw] inset-0 z-[101] bg-muted overflow-y-auto theme-transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-foreground">
                      Settings
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-2 rounded-md hover:bg-hover theme-transition"
                        aria-label="Close"
                      >
                        <X size={20} className="text-foreground" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Configuration controls */}
                  {currentConfig && (
                    <div className="mb-4">
                      <ConfigControls
                        prototypeId={currentConfig.prototypeId}
                        controls={currentConfig.controls}
                      />
                    </div>
                  )}

                  {/* Flush divider */}
                  <div className="border-t border-border my-4" />

                  {/* Dark mode and source code toggles */}
                  <button
                    onClick={toggleTheme}
                    className="text-sm text-foreground flex items-center justify-center gap-2 hover:text-foreground/80 theme-transition"
                  >
                    {theme.mode === 'light' ? (
                      <>
                        <Moon size={16} />
                        Dark mode
                      </>
                    ) : (
                      <>
                        <Sun size={16} />
                        Light mode
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Source code modal */}
      {currentPrototype && (
        <SourceCodeModal
          isOpen={isSourceModalOpen}
          onClose={() => setIsSourceModalOpen(false)}
          sourceFiles={currentPrototype.sourceFiles}
        />
      )}
    </>
  );
};

export default Navigation;