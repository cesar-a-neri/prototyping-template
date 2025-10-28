import React from 'react';
import { ConfigControl } from './types';
import { useConfig } from './ConfigProvider';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Info } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../components/ui/tooltip';

interface ConfigControlsProps {
    prototypeId: string;
    controls: ConfigControl[];
}

export const ConfigControls: React.FC<ConfigControlsProps> = ({ prototypeId, controls }) => {
    const { configValues, updateConfig } = useConfig();
    const prototypeValues = configValues[prototypeId] || {};

    if (controls.length === 0) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex flex-col gap-3">
                {controls.map((control) => (
                    <ConfigControlRenderer
                        key={control.id}
                        control={control}
                        value={prototypeValues[control.id] ?? control.defaultValue}
                        onChange={(value) => updateConfig(prototypeId, control.id, value)}
                    />
                ))}
            </div>
        </TooltipProvider>
    );
};

interface ConfigControlRendererProps {
    control: ConfigControl;
    value: boolean | string | number;
    onChange: (value: boolean | string | number) => void;
}

const ConfigControlRenderer: React.FC<ConfigControlRendererProps> = ({ control, value, onChange }) => {
    switch (control.type) {
        case 'boolean':
            return (
                <div className="space-y-0.5">
                    <label className="text-xs text-foreground">
                        {control.label}
                        {control.description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={12} className="text-muted-foreground cursor-help inline-block ml-1 align-text-bottom" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{control.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </label>
                    <SegmentedControl
                        value={value as boolean}
                        onValueChange={onChange}
                        className="w-full"
                    />
                </div>
            );

        case 'text':
            return (
                <div className="space-y-0.5">
                    <label className="text-xs text-foreground">
                        {control.label}
                        {control.description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={12} className="text-muted-foreground cursor-help inline-block ml-1 align-text-bottom" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{control.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </label>
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={control.placeholder}
                        className="w-full h-8 px-2.5 py-1.5 text-xs bg-background hover:bg-hover border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    />
                </div>
            );

        case 'number': {
            const [localValue, setLocalValue] = React.useState(String(value));

            const handleCommit = (inputValue: string) => {
                const numValue = Number(inputValue);

                // If invalid input, reset to current stored value
                if (isNaN(numValue) || inputValue === '') {
                    setLocalValue(String(value));
                    return;
                }

                // Apply min/max constraints if specified
                let constrainedValue = numValue;
                if (control.min !== undefined && numValue < control.min) {
                    constrainedValue = control.min;
                }
                if (control.max !== undefined && numValue > control.max) {
                    constrainedValue = control.max;
                }

                // Update both local and global state
                setLocalValue(String(constrainedValue));
                onChange(constrainedValue);
            };

            return (
                <div className="space-y-0.5">
                    <label className="text-xs text-foreground">
                        {control.label}
                        {control.description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={12} className="text-muted-foreground cursor-help inline-block ml-1 align-text-center" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{control.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </label>
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => {
                            // Allow any input during typing
                            setLocalValue(e.target.value);
                        }}
                        onBlur={(e) => {
                            handleCommit(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCommit(e.currentTarget.value);
                                e.currentTarget.blur(); // Optionally blur the input after Enter
                            }
                        }}
                        onFocus={() => {
                            // Sync local value with actual value when focusing
                            setLocalValue(String(value));
                        }}
                        className="w-full h-8 px-2.5 py-1.5 text-xs bg-background hover:bg-hover border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    />
                </div>
            );
        }

        case 'dropdown':
            return (
                <div className="space-y-0.5">
                    <label className="text-xs text-foreground">
                        {control.label}
                        {control.description && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={12} className="text-muted-foreground cursor-help inline-block ml-1 align-text-bottom" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{control.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </label>
                    <Select value={value as string} onValueChange={onChange}>
                        <SelectTrigger className="w-full h-8 px-2.5 bg-background hover:bg-hover border-0 text-foreground text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            {control.options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="text-popover-foreground hover:bg-hover focus:bg-hover text-xs"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );

        default:
            return null;
    }
}; 