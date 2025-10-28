import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PrototypeConfig, ConfigState, ConfigValues } from './types';

interface ConfigContextType {
    configs: PrototypeConfig[];
    configValues: ConfigState;
    registerConfig: (config: PrototypeConfig) => void;
    updateConfig: (prototypeId: string, controlId: string, value: boolean | string | number) => void;
    getConfigValue: <T = boolean | string | number>(prototypeId: string, controlId: string, defaultValue?: T) => T;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
    children: ReactNode;
    storageKey?: string;
}

export function ConfigProvider({
    children,
    storageKey = 'prototype-configs'
}: ConfigProviderProps) {
    const [configs, setConfigs] = useState<PrototypeConfig[]>([]);
    const [configValues, setConfigValues] = useState<ConfigState>(() => {
        // Try to load from localStorage
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(storageKey);
                return stored ? JSON.parse(stored) : {};
            } catch {
                return {};
            }
        }
        return {};
    });

    // Save to localStorage whenever configValues change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(configValues));
            } catch (error) {
                console.warn('Failed to save config to localStorage:', error);
            }
        }
    }, [configValues, storageKey]);

    const registerConfig = (config: PrototypeConfig) => {
        setConfigs(prev => {
            // Don't register the same config twice
            if (prev.some(c => c.prototypeId === config.prototypeId)) {
                return prev;
            }

            // Initialize default values for this prototype if not already set
            setConfigValues(prevValues => {
                if (prevValues[config.prototypeId]) {
                    return prevValues; // Already initialized
                }

                const defaultValues: ConfigValues = {};
                config.controls.forEach(control => {
                    defaultValues[control.id] = control.defaultValue;
                });

                return {
                    ...prevValues,
                    [config.prototypeId]: defaultValues
                };
            });

            return [...prev, config];
        });
    };

    const updateConfig = (prototypeId: string, controlId: string, value: boolean | string | number) => {
        setConfigValues(prev => ({
            ...prev,
            [prototypeId]: {
                ...prev[prototypeId],
                [controlId]: value
            }
        }));
    };

    const getConfigValue = <T = boolean | string | number>(
        prototypeId: string,
        controlId: string,
        defaultValue?: T
    ): T => {
        const prototypeValues = configValues[prototypeId];
        if (!prototypeValues || !(controlId in prototypeValues)) {
            return defaultValue as T;
        }
        return prototypeValues[controlId] as T;
    };

    const value: ConfigContextType = {
        configs,
        configValues,
        registerConfig,
        updateConfig,
        getConfigValue,
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig(): ConfigContextType {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}

// Convenience hook for prototypes to register their config and get their values
export function usePrototypeConfig(config: PrototypeConfig) {
    const { registerConfig, getConfigValue, updateConfig } = useConfig();

    // Register the config when the hook is first used
    useEffect(() => {
        registerConfig(config);
    }, [registerConfig, config]);

    return {
        getValue: <T = boolean | string | number>(controlId: string, defaultValue?: T) =>
            getConfigValue<T>(config.prototypeId, controlId, defaultValue),
        updateValue: (controlId: string, value: boolean | string | number) =>
            updateConfig(config.prototypeId, controlId, value)
    };
} 