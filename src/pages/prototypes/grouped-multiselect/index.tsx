import React, { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Option {
    value: string;
    label: string;
    group?: string;
}

const options: Option[] = [
    { value: 'factual', label: 'Factual', group: 'Content Quality' },
    { value: 'inaccurate', label: 'Inaccurate', group: 'Content Quality' },
    { value: 'hallucination', label: 'Hallucination', group: 'Content Quality' },
    { value: 'well-structured', label: 'Well-structured', group: 'Content Quality' },
    { value: 'helpful', label: 'Helpful', group: 'Response Attributes' },
    { value: 'harmful', label: 'Harmful', group: 'Response Attributes' },
    { value: 'biased', label: 'Biased', group: 'Response Attributes' },
    { value: 'neutral', label: 'Neutral', group: 'Response Attributes' },
    { value: 'offensive', label: 'Offensive', group: 'Safety & Ethics' },
    { value: 'safe', label: 'Safe', group: 'Safety & Ethics' },
    { value: 'toxic', label: 'Toxic', group: 'Safety & Ethics' },
    { value: 'coherent', label: 'Coherent' },
    { value: 'verbose', label: 'Verbose' },
    { value: 'concise', label: 'Concise' },
];

// Configuration for this prototype
const groupedMultiselectConfig: PrototypeConfig = {
    prototypeId: 'grouped-multiselect',
    title: 'Grouped Multiselect Configuration',
    controls: [
        {
            id: 'showGroupPrefix',
            type: 'boolean',
            label: 'Show Group Prefix',
            description: 'Display group name prefix before badge label',
            defaultValue: false
        }
    ]
};

interface SelectedPillProps {
    label: string;
    group?: string;
    showGroupPrefix?: boolean;
    onRemove?: () => void;
    maxWidth?: string;
    showRemove?: boolean;
}

const SelectedPill: React.FC<SelectedPillProps> = ({
    label,
    group,
    showGroupPrefix = false,
    onRemove,
    maxWidth,
    showRemove = true
}) => (
    <span className="inline-flex items-center gap-1 rounded bg-primary/10 border border-border px-2 h-5 text-xs font-medium text-foreground shrink-0">
        <span className={cn("truncate flex items-center gap-1", maxWidth)}>
            {showGroupPrefix && group && (
                <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <span className="text-muted-foreground max-w-[80px] truncate shrink-0">
                                {group}:
                            </span>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content
                                className="bg-popover text-popover-foreground px-2 py-1 text-xs rounded border border-border shadow-md z-50"
                                sideOffset={5}
                            >
                                {group}
                                <Tooltip.Arrow className="fill-border" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            )}
            <span className="truncate">{label}</span>
        </span>
        {showRemove && onRemove && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="hover:text-foreground/70"
            >
                <X className="h-3 w-3" />
            </button>
        )}
    </span>
);

interface MultiselectInputProps {
    selectedValues: string[];
    selectedOptions: Option[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onRemove: (value: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    placeholder?: string;
    showGroupPrefix?: boolean;
}

const MultiselectInput: React.FC<MultiselectInputProps> = ({
    selectedValues,
    selectedOptions,
    searchQuery,
    setSearchQuery,
    onRemove,
    searchInputRef,
    placeholder = "Select items...",
    showGroupPrefix = false
}) => (
    <div className="flex flex-wrap gap-1 min-h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
        {selectedOptions.map((option) => (
            <SelectedPill
                key={option.value}
                label={option.label}
                group={option.group}
                showGroupPrefix={showGroupPrefix}
                onRemove={() => onRemove(option.value)}
            />
        ))}
        <input
            ref={searchInputRef}
            type="text"
            placeholder={selectedValues.length === 0 ? placeholder : ""}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
        />
    </div>
);

interface MultiselectOptionsProps {
    selectedValues: string[];
    toggleOption: (value: string) => void;
    filteredOptions: Option[];
    groupedOptions: { grouped: Record<string, Option[]>; ungrouped: Option[] };
}

const MultiselectOptions: React.FC<MultiselectOptionsProps> = ({
    selectedValues,
    toggleOption,
    filteredOptions,
    groupedOptions,
}) => (
    <div className="max-h-[300px] overflow-y-auto p-1">
        {Object.entries(groupedOptions.grouped).map(([groupName, groupOptions]) => (
            <div key={groupName}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {groupName}
                </div>
                {groupOptions.map(option => (
                    <div
                        key={option.value}
                        onClick={() => toggleOption(option.value)}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-hover hover:text-hover-foreground"
                    >
                        <div className="flex items-center justify-center w-4 h-4 mr-2 border border-border rounded-sm">
                            {selectedValues.includes(option.value) && (
                                <Check className="h-3 w-3" />
                            )}
                        </div>
                        {option.label}
                    </div>
                ))}
            </div>
        ))}

        {groupedOptions.ungrouped.length > 0 && (
            <div>
                {Object.keys(groupedOptions.grouped).length > 0 && (
                    <div className="my-1 h-px bg-border" />
                )}
                {groupedOptions.ungrouped.map(option => (
                    <div
                        key={option.value}
                        onClick={() => toggleOption(option.value)}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-hover hover:text-hover-foreground"
                    >
                        <div className="flex items-center justify-center w-4 h-4 mr-2 border border-border rounded-sm">
                            {selectedValues.includes(option.value) && (
                                <Check className="h-3 w-3" />
                            )}
                        </div>
                        {option.label}
                    </div>
                ))}
            </div>
        )}

        {filteredOptions.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
            </div>
        )}
    </div>
);

const GroupedMultiselect: React.FC = () => {
    // Register config and get access to values
    const { getValue } = usePrototypeConfig(groupedMultiselectConfig);
    const showGroupPrefix = getValue<boolean>('showGroupPrefix', false);

    // Unified state - shared between both instances
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    // UI state for form (left side)
    const [formSearchQuery, setFormSearchQuery] = useState('');
    const formSearchInputRef = React.useRef<HTMLInputElement>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const formContainerRef = React.useRef<HTMLDivElement>(null);

    // UI state for spreadsheet (right side)
    const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
    const [spreadsheetSearchQuery, setSpreadsheetSearchQuery] = useState('');
    const spreadsheetSearchInputRef = React.useRef<HTMLInputElement>(null);
    const spreadsheetContainerRef = React.useRef<HTMLDivElement>(null);

    // Shared filtering and grouping logic
    const getFilteredAndGroupedOptions = (searchQuery: string) => {
        const filtered = options.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const grouped: Record<string, Option[]> = {};
        const ungrouped: Option[] = [];

        filtered.forEach(option => {
            if (option.group) {
                if (!grouped[option.group]) {
                    grouped[option.group] = [];
                }
                grouped[option.group].push(option);
            } else {
                ungrouped.push(option);
            }
        });

        return { filtered, grouped, ungrouped };
    };

    // Form filtering and grouping
    const formOptions = useMemo(() =>
        getFilteredAndGroupedOptions(formSearchQuery),
        [formSearchQuery]
    );

    // Spreadsheet filtering and grouping
    const spreadsheetOptions = useMemo(() =>
        getFilteredAndGroupedOptions(spreadsheetSearchQuery),
        [spreadsheetSearchQuery]
    );

    // Unified toggle handler - works for both instances
    const toggleOption = (value: string, inputRef: React.RefObject<HTMLInputElement | null>, setSearchQuery: (query: string) => void) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
        setSearchQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const toggleFormOption = (value: string) => {
        toggleOption(value, formSearchInputRef, setFormSearchQuery);
    };

    const toggleSpreadsheetOption = (value: string) => {
        toggleOption(value, spreadsheetSearchInputRef, setSpreadsheetSearchQuery);
    };

    // Shared helper to get selected options from values
    const getSelectedOptions = (values: string[]) =>
        values.map(value => options.find(opt => opt.value === value)).filter((opt): opt is Option => opt !== undefined);

    // Single source of selected options, computed from unified state
    const selectedOptions = useMemo(() =>
        getSelectedOptions(selectedValues),
        [selectedValues]
    );

    const [formPopoverPosition, setFormPopoverPosition] = React.useState({ left: 0, top: 0, width: 0 });

    const updateFormPopoverPosition = React.useCallback(() => {
        if (formContainerRef.current) {
            const rect = formContainerRef.current.getBoundingClientRect();
            setFormPopoverPosition({
                left: rect.left,
                top: rect.bottom + 4,
                width: rect.width
            });
        }
    }, []);

    React.useEffect(() => {
        if (isFormOpen) {
            setTimeout(() => formSearchInputRef.current?.focus(), 0);
            updateFormPopoverPosition();
        }
    }, [isFormOpen, updateFormPopoverPosition]);

    React.useEffect(() => {
        if (isFormOpen) {
            updateFormPopoverPosition();
        }
    }, [selectedValues, isFormOpen, updateFormPopoverPosition]);

    React.useEffect(() => {
        if (isSpreadsheetOpen) {
            setTimeout(() => spreadsheetSearchInputRef.current?.focus(), 0);
        }
    }, [isSpreadsheetOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formContainerRef.current && !formContainerRef.current.contains(event.target as Node)) {
                setIsFormOpen(false);
            }
            if (spreadsheetContainerRef.current && !spreadsheetContainerRef.current.contains(event.target as Node)) {
                setIsSpreadsheetOpen(false);
            }
        };

        if (isFormOpen || isSpreadsheetOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFormOpen, isSpreadsheetOpen]);

    return (
        <div className="min-h-screen bg-muted">
            <div className="grid grid-cols-2 h-screen">
                {/* Left Side - Inline Form Field */}
                <div className="flex items-start justify-center p-8 pt-16 border-r border-border">
                    <div className="w-full max-w-2xl">
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-1">Multi-select in a form</h2>
                            <p className="text-sm text-muted-foreground">
                                Click the input to open the multiselect popover below the field.
                            </p>
                        </div>

                        {/* Fake form fields above (lower opacity) */}
                        <div className="space-y-6 opacity-30 mb-6">
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                                <div>
                                    <label className="text-sm font-medium">Data Sample ID</label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Unique identifier for this sample</p>
                                </div>
                                <input
                                    type="text"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="sample-12345"
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                                <div>
                                    <label className="text-sm font-medium">Response Text</label>
                                    <p className="text-xs text-muted-foreground mt-0.5">The model's output to evaluate</p>
                                </div>
                                <textarea
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="The model's response appears here..."
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Active form field - the multiselect component */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                                <div>
                                    <label className="text-sm font-medium">Annotation Labels</label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Select all applicable labels</p>
                                </div>
                                <div ref={formContainerRef} className="relative">
                                    <div onClick={() => setIsFormOpen(true)} className={cn(
                                        "[&>div]:transition-colors",
                                        isFormOpen ? "[&>div]:!border-ring" : "[&>div]:hover:!border-gray-9"
                                    )}>
                                        <MultiselectInput
                                            selectedValues={selectedValues}
                                            selectedOptions={selectedOptions}
                                            searchQuery={formSearchQuery}
                                            setSearchQuery={setFormSearchQuery}
                                            onRemove={toggleFormOption}
                                            searchInputRef={formSearchInputRef}
                                            showGroupPrefix={showGroupPrefix}
                                        />
                                    </div>

                                    {isFormOpen && (
                                        <div className="fixed inset-0 z-50 pointer-events-none">
                                            <div
                                                className="absolute rounded-md border border-border bg-popover text-popover-foreground shadow-md pointer-events-auto"
                                                style={{
                                                    left: `${formPopoverPosition.left}px`,
                                                    top: `${formPopoverPosition.top}px`,
                                                    width: `${formPopoverPosition.width}px`,
                                                }}
                                            >
                                                <MultiselectOptions
                                                    selectedValues={selectedValues}
                                                    toggleOption={toggleFormOption}
                                                    filteredOptions={formOptions.filtered}
                                                    groupedOptions={{ grouped: formOptions.grouped, ungrouped: formOptions.ungrouped }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fake form fields below (lower opacity) */}
                        <div className="space-y-6 opacity-30 mt-6">
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                                <div>
                                    <label className="text-sm font-medium">Confidence Score</label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Your confidence in this annotation</p>
                                </div>
                                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Spreadsheet with Popover */}
                <div className="flex items-start justify-center p-8 pt-16">
                    <div className="space-y-4">
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-1">Multi-select in a spreadsheet</h2>
                            <p className="text-sm text-muted-foreground">
                                Click the center cell to open the multiselect popover. This demonstrates how the component works in a constrained space.
                            </p>
                        </div>

                        <div className="bg-card inline-block border border-border rounded-md overflow-hidden">
                            <div className="grid grid-cols-3">
                                {Array.from({ length: 9 }).map((_, index) => {
                                    const isMiddle = index === 4;

                                    if (isMiddle) {
                                        return (
                                            <div key={index} ref={spreadsheetContainerRef} className="relative group">
                                                <button
                                                    onClick={() => setIsSpreadsheetOpen(!isSpreadsheetOpen)}
                                                    className={cn(
                                                        "w-32 h-[30px] border-r border-b border-border text-xs px-1.5 hover:bg-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset text-left overflow-hidden flex items-center",
                                                        selectedValues.length === 0 && "text-muted-foreground"
                                                    )}
                                                >
                                                    {selectedValues.length === 0 ? (
                                                        <div className="truncate">Select...</div>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            {selectedOptions.map((option) => (
                                                                <SelectedPill
                                                                    key={option.value}
                                                                    label={option.label}
                                                                    group={option.group}
                                                                    showGroupPrefix={showGroupPrefix}
                                                                    showRemove={false}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </button>

                                                {!isSpreadsheetOpen && selectedValues.length > 0 && (
                                                    <div className="fixed inset-0 z-40 pointer-events-none">
                                                        <div
                                                            className="absolute w-80 rounded-md border border-border bg-popover text-popover-foreground shadow-md pointer-events-none hidden group-hover:block"
                                                            style={{
                                                                left: `${(spreadsheetContainerRef.current?.getBoundingClientRect().left ?? 0) - 16}px`,
                                                                top: `${(spreadsheetContainerRef.current?.getBoundingClientRect().top ?? 0) - 13.5}px`,
                                                            }}
                                                        >
                                                            <div className="p-2">
                                                                <div className="flex flex-wrap gap-1 min-h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                                    {selectedOptions.map((option) => (
                                                                        <SelectedPill
                                                                            key={option.value}
                                                                            label={option.label}
                                                                            group={option.group}
                                                                            showGroupPrefix={showGroupPrefix}
                                                                            showRemove={false}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mt-1.5">
                                                                    Click to edit
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {isSpreadsheetOpen && (
                                                    <div className="fixed inset-0 z-50 pointer-events-none">
                                                        <div
                                                            className="absolute w-80 rounded-md border border-border bg-popover text-popover-foreground shadow-md pointer-events-auto"
                                                            style={{
                                                                left: `${(spreadsheetContainerRef.current?.getBoundingClientRect().left ?? 0) - 16}px`,
                                                                top: `${(spreadsheetContainerRef.current?.getBoundingClientRect().top ?? 0) - 13.5}px`,
                                                            }}
                                                        >
                                                            <div className="p-2 border-b border-border">
                                                                <MultiselectInput
                                                                    selectedValues={selectedValues}
                                                                    selectedOptions={selectedOptions}
                                                                    searchQuery={spreadsheetSearchQuery}
                                                                    setSearchQuery={setSpreadsheetSearchQuery}
                                                                    onRemove={toggleSpreadsheetOption}
                                                                    searchInputRef={spreadsheetSearchInputRef}
                                                                    showGroupPrefix={showGroupPrefix}
                                                                />
                                                            </div>
                                                            <MultiselectOptions
                                                                selectedValues={selectedValues}
                                                                toggleOption={toggleSpreadsheetOption}
                                                                filteredOptions={spreadsheetOptions.filtered}
                                                                groupedOptions={{ grouped: spreadsheetOptions.grouped, ungrouped: spreadsheetOptions.ungrouped }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="w-32 h-[30px] border-r border-b border-border bg-muted/30"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const title = 'Grouped Multiselect';
export const route = '/grouped-multiselect';

export default GroupedMultiselect;
