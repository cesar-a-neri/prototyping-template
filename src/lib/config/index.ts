// Export all config functionality
export * from './types';
export * from './ConfigProvider';
export * from './ConfigControls';

// Re-export commonly used types and functions
export type {
    ConfigControlType,
    ConfigControl,
    BooleanControl,
    TextControl,
    DropdownControl,
    NumberControl,
    PrototypeConfig,
    ConfigValues,
    ConfigState
} from './types';

export {
    ConfigProvider,
    useConfig,
    usePrototypeConfig
} from './ConfigProvider';

export { ConfigControls } from './ConfigControls'; 