import { createContext, useContext, useState, ReactNode } from 'react';

interface DebugModeContextType {
    debugMode: boolean;
    toggleDebugMode: () => void;
}

const DebugModeContext = createContext<DebugModeContextType | undefined>(undefined);

export function DebugModeProvider({ children }: { children: ReactNode }) {
    const [debugMode, setDebugMode] = useState(() => {
        try {
            return localStorage.getItem('prototype-debug-mode') === 'true';
        } catch {
            return false;
        }
    });

    const toggleDebugMode = () => {
        setDebugMode(prev => {
            const next = !prev;
            try {
                localStorage.setItem('prototype-debug-mode', String(next));
            } catch { /* ignore */ }
            return next;
        });
    };

    return (
        <DebugModeContext.Provider value={{ debugMode, toggleDebugMode }}>
            {children}
        </DebugModeContext.Provider>
    );
}

export function useDebugMode(): DebugModeContextType {
    const ctx = useContext(DebugModeContext);
    if (!ctx) throw new Error('useDebugMode must be used within DebugModeProvider');
    return ctx;
}
