export type ConfigControlType = 'boolean' | 'text' | 'dropdown' | 'number';

export interface ConfigControlBase {
    id: string;
    label: string;
    description?: string;
}

export interface BooleanControl extends ConfigControlBase {
    type: 'boolean';
    defaultValue: boolean;
}

export interface TextControl extends ConfigControlBase {
    type: 'text';
    defaultValue: string;
    placeholder?: string;
}

export interface DropdownControl extends ConfigControlBase {
    type: 'dropdown';
    defaultValue: string;
    options: { value: string; label: string }[];
}

export interface NumberControl extends ConfigControlBase {
    type: 'number';
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
}

export type ConfigControl = BooleanControl | TextControl | DropdownControl | NumberControl;

export interface PrototypeConfig {
    prototypeId: string;
    title: string;
    controls: ConfigControl[];
}

export type ConfigValues = Record<string, boolean | string | number>;

export interface ConfigState {
    [prototypeId: string]: ConfigValues;
} 