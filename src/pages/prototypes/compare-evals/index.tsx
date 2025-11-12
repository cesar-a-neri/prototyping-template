import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ArrowLeft, Filter, ChevronDown as SortIcon, MoreHorizontal, Tag, Plus, Calendar, RefreshCw, Search, Download, ArrowUpDown, List, Grid3x3, Grid2x2, TableIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Layers, Check, Trash2, Edit } from 'lucide-react';
import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';
import { cn } from '@/lib/utils';
import { loadEvaluationMetadata, loadEvaluationByName, loadEvaluationGroupsFromLocalStorage, saveEvaluationGroups, type EvaluationMetadata, type EvaluationData, type EvaluationGroup } from '@/utils/csvLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Configuration for this prototype
const compareEvalsConfig: PrototypeConfig = {
    prototypeId: 'compare-evals',
    title: 'Compare Evals Configuration',
    controls: [
        // Add your configuration controls here
        // Example:
        // {
        //     id: 'exampleBoolean',
        //     type: 'boolean',
        //     label: 'Example Toggle',
        //     description: 'Description of what this toggle does',
        //     defaultValue: false
        // }
    ]
};

// Navigation Component
const Navigation: React.FC = () => {
    const tabs = [
        { id: 'agents', label: 'Agents' },
        { id: 'traces', label: 'Traces' },
        { id: 'evaluations', label: 'Evaluations', active: true },
        { id: 'workflows', label: 'Workflows' },
        { id: 'assets', label: 'Assets' },
    ];

    return (
        <nav className="bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 py-2">
                {/* Left side - Logo, Project selector, and Tabs */}
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img 
                            src="/images/logo.png" 
                            alt="Logo" 
                            className="w-6 h-6"
                        />
                        {/* Project Dropdown */}
                        <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-hover text-sm font-medium">
                            Manta
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Tabs - Hidden on mobile, visible on md+ */}
                    <div className="hidden md:flex items-center gap-1 ml-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={cn(
                                    "px-2 h-7 text-sm font-medium rounded transition-colors flex items-center justify-center",
                                    tab.active
                                        ? "text-foreground bg-[#d9daff]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-hover"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side - Avatar */}
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-foreground">
                        C
                    </div>
                </div>
            </div>

            {/* Mobile tabs - Full width below on small screens */}
            <div className="md:hidden border-t border-border overflow-x-auto">
                <div className="flex items-center gap-1 px-4 py-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={cn(
                                "px-2 h-7 text-sm font-medium rounded whitespace-nowrap transition-colors flex items-center justify-center",
                                tab.active
                                    ? "text-foreground bg-[#d9daff]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-hover"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

// Evaluation Card Component
interface EvaluationCardProps {
    name: string;
    date: string;
    dateLabel: string;
    tags: string[];
    isHighlighted?: boolean;
    onClick?: () => void;
    withCheckbox?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ 
    name, 
    date, 
    dateLabel, 
    tags, 
    isHighlighted = false,
    onClick,
    withCheckbox = false,
    isChecked = false,
    onCheckChange
}) => {
    const handleClick = () => {
        if (withCheckbox && onCheckChange) {
            onCheckChange(!isChecked);
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={cn(
                "bg-white border rounded-lg py-6 flex flex-col gap-2 cursor-pointer hover:border-[#4f3fd4] transition-colors",
                withCheckbox ? "px-6" : "px-6",
                isHighlighted ? "border-[#4f3fd4]" : "border-border"
            )}
        >
            <div className="flex gap-4">
                {withCheckbox && (
                    <div className="flex items-start pt-0.5">
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onCheckChange?.(!isChecked);
                            }}
                            className={cn(
                                "w-3.5 h-3.5 rounded flex items-center justify-center cursor-pointer transition-colors",
                                isChecked
                                    ? "bg-[#714dff] border border-[#714dff]"
                                    : "bg-white border border-border"
                            )}
                        >
                            {isChecked && (
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground leading-[16px]">
                        {name}
                    </h3>
                            {!withCheckbox && (
                    <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                            )}
                </div>
                <p className="text-xs text-muted-foreground leading-[16px]">
                    {dateLabel} {date}
                </p>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {tags.map((tag, index) => (
                    <span 
                        key={index}
                        className="inline-flex items-center px-[6px] py-[2px] rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0] leading-4"
                    >
                        {tag}
                    </span>
                ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Group Card Component
interface GroupCardProps {
    group: EvaluationGroup;
    isSelected?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, isSelected = false, onClick, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white border rounded-lg px-6 py-6 flex flex-col gap-2 cursor-pointer hover:border-[#4f3fd4] transition-colors relative",
                isSelected ? "border-[#4f3fd4]" : "border-border"
            )}
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
                        <h3 className="text-xs font-medium text-foreground leading-[16px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {group.name}
                        </h3>
                        <span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0] leading-4 shrink-0">
                            {group.evaluations.length}
                        </span>
                    </div>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onEdit?.();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2"
                                >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onDelete?.();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground leading-[16px]">
                    Created {group.createdDate}
                </p>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
                <Tag className="w-3 h-3 text-muted-foreground" />
                {group.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-[6px] py-[2px] rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0] leading-4"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

// Side Panel Component
interface SidePanelProps {
    selectedEvaluation: string;
    onSelectEvaluation: (name: string) => void;
    evaluations: EvaluationMetadata[];
    onTabChange?: (tab: 'all' | 'groups') => void;
    isCreatingGroup?: boolean;
    onCreatingGroupChange?: (isCreating: boolean) => void;
    onSelectedEvaluationsChange?: (evaluations: string[]) => void;
    onGroupNameChange?: (name: string) => void;
    savedGroups?: EvaluationGroup[];
    selectedGroup?: EvaluationGroup | null;
    selectedGroupEvaluations?: string[];
    editingGroupId?: string | null;
    groupName?: string;
    onSaveGroup?: (group: EvaluationGroup) => void;
    onUpdateGroup?: (group: EvaluationGroup) => void;
    onSelectGroup?: (group: EvaluationGroup) => void;
    onDeleteGroup?: (id: string) => void;
    onEditGroup?: (group: EvaluationGroup) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
    selectedEvaluation, 
    onSelectEvaluation, 
    evaluations, 
    onTabChange,
    isCreatingGroup: parentIsCreatingGroup = false,
    onCreatingGroupChange,
    onSelectedEvaluationsChange,
    onGroupNameChange,
    savedGroups = [],
    selectedGroup,
    selectedGroupEvaluations: parentSelectedGroupEvaluations = [],
    editingGroupId = null,
    groupName: parentGroupName = '',
    onSaveGroup,
    onUpdateGroup,
    onSelectGroup,
    onDeleteGroup,
    onEditGroup
}) => {
    const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
    const [searchValue, setSearchValue] = useState('');
    const [groupSearchValue, setGroupSearchValue] = useState('');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedEvaluations, setSelectedEvaluations] = useState<Set<string>>(new Set());
    const [evalSearchValue, setEvalSearchValue] = useState('');

    // Sync parent's isCreatingGroup state with local state
    useEffect(() => {
        setIsCreatingGroup(parentIsCreatingGroup);
    }, [parentIsCreatingGroup]);

    // Pre-populate form when entering edit mode (editingGroupId is set)
    useEffect(() => {
        if (editingGroupId) {
            // Set the group name
            if (parentGroupName) {
                setGroupName(parentGroupName);
            }
            // Set the selected evaluations
            if (parentSelectedGroupEvaluations.length > 0) {
                setSelectedEvaluations(new Set(parentSelectedGroupEvaluations));
                onSelectedEvaluationsChange?.(parentSelectedGroupEvaluations);
            }
        }
    }, [editingGroupId]); // Only run when editingGroupId changes

    const handleTabChange = (tab: 'all' | 'groups') => {
        setActiveTab(tab);
        onTabChange?.(tab);
        // Only close the creation form if it's open
        if (isCreatingGroup) {
            setIsCreatingGroup(false);
            onCreatingGroupChange?.(false);
        }
        // Don't clear selections - let the view persist
    };

    const handleCreateGroup = () => {
        // Get today's date in "MMM D YYYY" format
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const initialGroupName = `${formattedDate} Evaluation Group`;
        setGroupName(initialGroupName);
        setIsCreatingGroup(true);
        setSelectedEvaluations(new Set());
        onCreatingGroupChange?.(true);
        onSelectedEvaluationsChange?.([]);
        onGroupNameChange?.(initialGroupName);
    };

    const handleCancelCreateGroup = () => {
        setIsCreatingGroup(false);
        setGroupName('');
        setSelectedEvaluations(new Set());
        setEvalSearchValue('');
        onCreatingGroupChange?.(false);
        onSelectedEvaluationsChange?.([]);
    };

    const handleToggleEvaluation = (evalName: string) => {
        const newSelected = new Set(selectedEvaluations);
        if (newSelected.has(evalName)) {
            newSelected.delete(evalName);
        } else {
            newSelected.add(evalName);
        }
        setSelectedEvaluations(newSelected);
        onSelectedEvaluationsChange?.(Array.from(newSelected));
    };

    const filteredEvaluations = evaluations.filter(evaluation =>
        evaluation.name.toLowerCase().includes(evalSearchValue.toLowerCase())
    );

    const filteredGroups = savedGroups.filter(group =>
        group.name.toLowerCase().includes(groupSearchValue.toLowerCase())
    );

    // Render create group form
    if (isCreatingGroup) {
        return (
            <div className="w-[430px] h-full bg-white border-r border-border flex flex-col">
                {/* Create Group Form */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-6 p-6">
                        {/* Breadcrumb */}
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground">Configure Evaluation Group</span>
                        </div>

                        {/* Group Name Input */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-foreground">
                                Evaluation Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => {
                                    setGroupName(e.target.value);
                                    onGroupNameChange?.(e.target.value);
                                }}
                                className="w-full h-8 px-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                            />
                        </div>

                        {/* Tags Input (Optional) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">
                                Tags <span className="text-muted-foreground">(Optional)</span>
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search or create new tags..."
                                    className="w-full h-8 pl-8 pr-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                                />
                            </div>
                        </div>

                        {/* Metadata (Optional) */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
                                Metadata <span className="text-muted-foreground">(Optional)</span>
                            </label>
                            <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-[#613ee0] border border-[rgba(7,1,255,0.29)] rounded hover:bg-[#fafbff]">
                                Add
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Evaluations Section */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">
                                Evaluations
                            </label>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search evaluations..."
                                    value={evalSearchValue}
                                    onChange={(e) => setEvalSearchValue(e.target.value)}
                                    className="w-full h-8 pl-8 pr-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                                />
                            </div>

                            {/* Evaluation Cards with Checkboxes */}
                            <div className="flex flex-col gap-1">
                                {filteredEvaluations.map((evaluation, index) => (
                                    <EvaluationCard
                                        key={index}
                                        {...evaluation}
                                        withCheckbox={true}
                                        isChecked={selectedEvaluations.has(evaluation.name)}
                                        onCheckChange={() => handleToggleEvaluation(evaluation.name)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border bg-[#fbfcff] px-4 py-6 shrink-0 flex items-center justify-between">
                    <button
                        onClick={handleCancelCreateGroup}
                        className="h-8 px-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (selectedEvaluations.size > 0) {
                                if (editingGroupId) {
                                    // Update existing group
                                    const updatedGroup: EvaluationGroup = {
                                        id: editingGroupId,
                                        name: groupName,
                                        evaluations: Array.from(selectedEvaluations),
                                        createdDate: savedGroups.find(g => g.id === editingGroupId)?.createdDate || new Date().toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        }),
                                        tags: savedGroups.find(g => g.id === editingGroupId)?.tags || ['Sample Tag', 'Demo']
                                    };
                                    onUpdateGroup?.(updatedGroup);
                                } else {
                                    // Create new group
                                    const newGroup: EvaluationGroup = {
                                        id: Date.now().toString(),
                                        name: groupName,
                                        evaluations: Array.from(selectedEvaluations),
                                        createdDate: new Date().toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        }),
                                        tags: ['Sample Tag', 'Demo'] // Dummy tags for now
                                    };
                                    onSaveGroup?.(newGroup);
                                }
                                // Reset local form state only
                                setIsCreatingGroup(false);
                                setGroupName('');
                                setSelectedEvaluations(new Set());
                                setEvalSearchValue('');
                                onCreatingGroupChange?.(false);
                            }
                        }}
                        disabled={selectedEvaluations.size === 0}
                        className={cn(
                            "h-8 px-3 text-sm font-medium rounded",
                            selectedEvaluations.size > 0
                                ? "bg-[#714dff] text-white hover:bg-[#5f3dd6]"
                                : "bg-[rgba(0,54,175,0.07)] text-[rgba(0,42,131,0.31)] cursor-not-allowed"
                        )}
                    >
                        {editingGroupId ? 'Save' : 'Create Group'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[430px] h-full bg-white border-r border-border flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-1 items-center">
                            <span className="text-sm text-foreground">Evaluations</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Create an evaluation or manage existing evaluations
                    </p>
                </div>
                <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-hover text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="px-6 shrink-0">
                <div className="flex items-start h-10 border-b border-border relative">
                    <button
                        onClick={() => handleTabChange('all')}
                        className={cn(
                            "flex-1 flex items-center justify-center h-full text-sm relative px-2",
                            activeTab === 'all' 
                                ? "text-[#2e1e71] font-semibold" 
                                : "text-muted-foreground"
                        )}
                    >
                        All
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('groups')}
                        className={cn(
                            "flex-1 flex items-center justify-center h-full text-sm relative px-2",
                            activeTab === 'groups' 
                                ? "text-[#2e1e71] font-semibold" 
                                : "text-muted-foreground"
                        )}
                    >
                        Groups
                        {activeTab === 'groups' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Search and Filter - Only show for 'all' tab */}
            {activeTab === 'all' && (
            <div className="px-6 py-4 flex gap-2 items-center shrink-0">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full h-8 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                    />
                </div>
                <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-hover text-muted-foreground hover:text-foreground">
                    <Filter className="w-4 h-4" />
                </button>
            </div>
            )}

            {/* Date Pickers and Sort - Only show for 'all' tab */}
            {activeTab === 'all' && (
            <div className="px-6 pb-4 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="07/31/2025"
                                defaultValue="07/31/2025"
                                className="w-[120px] h-8 px-2 pl-8 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                            />
                            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">-</span>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="07/31/2025"
                                defaultValue="07/31/2025"
                                className="w-[120px] h-8 px-2 pl-8 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                            />
                            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <button className="flex items-center gap-1 px-2 h-6 text-xs text-muted-foreground hover:text-foreground hover:bg-hover rounded">
                        Sort
                        <SortIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>
            )}

            {/* Search for Groups - Only show for 'groups' tab when there are groups */}
            {activeTab === 'groups' && savedGroups.length > 0 && (
            <div className="px-6 py-4 flex gap-2 items-center shrink-0">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={groupSearchValue}
                        onChange={(e) => setGroupSearchValue(e.target.value)}
                        className="w-full h-8 pl-9 pr-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                    />
                </div>
            </div>
            )}

            {/* Evaluation List or Empty State */}
            {activeTab === 'groups' ? (
                savedGroups.length > 0 ? (
                    <>
                        {/* Saved Groups List */}
                        <div className="flex-1 px-6 overflow-y-auto">
                            <div className="flex flex-col gap-2 pb-6">
                                {filteredGroups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        isSelected={selectedGroup?.id === group.id && parentSelectedGroupEvaluations.length > 0}
                                        onClick={() => onSelectGroup?.(group)}
                                        onDelete={() => onDeleteGroup?.(group.id)}
                                        onEdit={() => onEditGroup?.(group)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Footer - Create Evaluation Group button */}
                        <div className="border-t border-border bg-[#fbfcff] px-4 py-6 shrink-0">
                            <button 
                                onClick={handleCreateGroup}
                                className="w-full h-8 bg-white border border-[#8675ff] text-[#4f3fd4] rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#fafbff]"
                            >
                                <Layers className="w-4 h-4" />
                                Create Evaluation Group
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    // Empty State for Groups - Vertically centered
                    <div className="flex-1 flex items-center justify-center overflow-y-auto">
                        <div className="flex flex-col gap-4 items-center max-w-[382px] text-center px-6">
                            <div className="flex flex-col gap-0">
                                <h3 className="text-sm font-medium text-foreground leading-5">
                                    No Evaluation Groups Found
                                </h3>
                                <p className="text-sm text-muted-foreground leading-5">
                                    Create one to start comparing datasets.
                                </p>
                            </div>
                            <button 
                                onClick={handleCreateGroup}
                                className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-[#613ee0] border border-[rgba(7,1,255,0.29)] rounded hover:bg-[#fafbff]"
                            >
                                <Layers className="w-4 h-4" />
                                Create Evaluation Group
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            ) : (
                <>
                    {/* Evaluation List for All Tab */}
                    <div className="flex-1 px-6 overflow-y-auto">
                        <div className="flex flex-col gap-2 pb-6">
                            {evaluations.map((evaluation, index) => (
                                <EvaluationCard 
                                    key={index}
                                    {...evaluation}
                                    isHighlighted={evaluation.name === selectedEvaluation && parentSelectedGroupEvaluations.length === 0}
                                    onClick={() => onSelectEvaluation(evaluation.name)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer - Only show for 'all' tab */}
                    <div className="border-t border-border bg-[#fbfcff] px-4 py-6 shrink-0">
                        <button className="w-full h-8 bg-white border border-[#8675ff] text-[#4f3fd4] rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#fafbff]">
                            Create evaluation
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// Dummy data for the table
const dummyTableData = [
    {
        id: '12345',
        outputLatency: '60 ms',
        transcript: 'Agent: Good morning, how are you feeling today?\nPatient: A little tired, but otherwise okay.\nAgent: Any new symptoms since your last visit?\nPatient: Just some mild dizziness after standing up.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '60 ms',
        transcript: 'Agent: Hi, I\'m calling to confirm your follow-up appointment for next Tuesday. Does that still work for you?\nPatient: Yes, that\'s fine. What time is it again?\nAgent: 10:30 a.m. at the Rochester campus.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: I\'m checking in after your knee injection last week. How\'s the pain level now?\nPatient: Much better, maybe a three out of ten.\nAgent: That\'s great to hear. Any swelling or redness around the joint?...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: Just to confirm, you\'re taking the new dosage of metformin twice a day, correct?\nPatient: Yes, morning and night.\nAgent: Perfect. Any side effects so far?...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '100 ms',
        transcript: 'Agent: Your blood test came back with slightly elevated cholesterol levels.\nPatient: Oh, I see. Is that serious?\nAgent: Nothing alarming, but we\'ll adjust your diet and recheck in three...',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '45 ms',
        transcript: 'Agent: What brings you in today?\nPatient: I\'ve been having some chest tightness when I exercise.\nAgent: How long has that been happening?\nPatient: About a week, maybe a little longer.',
        annotatorOutput: 'Yes'
    },
    {
        id: '12345',
        outputLatency: '45 ms',
        transcript: 'Agent: Your test results look good. The doctor recommends a follow-up in six months.\nPatient: Okay, should I schedule that now?\nAgent: Yes, let\'s go ahead and set that up before you leave today....',
        annotatorOutput: 'Yes'
    },
];

// Helper function to check if a column contains numerical data
const isNumericalColumn = (data: EvaluationData[], columnName: string): boolean => {
    // Check the first few non-empty values
    const sampleSize = Math.min(10, data.length);
    let numericalCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
        const value = data[i][columnName];
        if (value !== '' && value !== null && value !== undefined) {
            const num = Number(value);
            if (!isNaN(num)) {
                numericalCount++;
            }
        }
    }
    
    // If more than 80% of samples are numerical, consider it a numerical column
    return numericalCount / sampleSize > 0.8;
};

// Helper function to prepare histogram data for numerical columns
const prepareHistogramData = (data: EvaluationData[], columnName: string) => {
    const values = data
        .map(row => Number(row[columnName]))
        .filter(val => !isNaN(val));
    
    if (values.length === 0) return [];
    
    // Check if all values are integers
    const areAllIntegers = values.every(val => Number.isInteger(val));
    
    // For integers, create discrete bars for each unique value
    if (areAllIntegers) {
        const valueCounts = new Map<number, number>();
        
        values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });
        
        // Convert to array and sort by value
        return Array.from(valueCounts.entries())
            .map(([value, count]) => ({
                range: value.toString(),
                count,
                midpoint: value
            }))
            .sort((a, b) => a.midpoint - b.midpoint);
    }
    
    // For floats, use binned ranges
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(2)}-${(min + (i + 1) * binSize).toFixed(2)}`,
        count: 0,
        midpoint: min + (i + 0.5) * binSize
    }));
    
    // Fill bins
    values.forEach(value => {
        const binIndex = Math.min(
            Math.floor((value - min) / binSize),
            binCount - 1
        );
        bins[binIndex].count++;
    });
    
    return bins;
};

// Helper function to prepare bar chart data for categorical columns
const prepareCategoricalData = (data: EvaluationData[], columnName: string) => {
    const valueCounts = new Map<string, number>();
    
    data.forEach(row => {
        const value = String(row[columnName] || '').trim();
        if (value !== '') {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        }
    });
    
    // Convert to array and sort by count
    return Array.from(valueCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
};

// Group Metrics Chart Component - for visualizing multiple evaluations together
interface GroupMetricsChartProps {
    columnName: string;
    evaluationsData: Map<string, EvaluationData[]>;
    evaluationNames: string[];
    evaluationColors: string[];
    index: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

const GroupMetricsChart: React.FC<GroupMetricsChartProps> = ({ 
    columnName, 
    evaluationsData, 
    evaluationNames, 
    evaluationColors,
    index,
    onEdit,
    onDelete
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const displayName = columnName
        .replace(/^eval_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    
    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;
    
    // Filter to only evaluations that have this column
    const evaluationsWithColumn = evaluationNames.filter(evalName => {
        const data = evaluationsData.get(evalName) || [];
        return data.length > 0 && data[0][columnName] !== undefined;
    });
    
    // If no evaluations have this column, show empty state
    if (evaluationsWithColumn.length === 0) {
        return (
            <div 
                className={cn(
                    "bg-white border flex flex-col",
                    isRightColumn && "md:-ml-[1px]",
                    index > 0 && "-mt-[1px] md:mt-0",
                    !isFirstRow && "md:-mt-[1px]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                    {(onEdit || onDelete) && (
                        <div className={cn(
                            "flex items-center gap-1 transition-opacity",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Edit graph"
                                >
                                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Delete graph"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }
    
    // Get corresponding colors for evaluations that have this column
    const filteredColors = evaluationsWithColumn.map(evalName => {
        const idx = evaluationNames.indexOf(evalName);
        return evaluationColors[idx];
    });
    
    // Check if the column is numerical by checking the first evaluation's data that has this column
    const firstEvalData = evaluationsData.get(evaluationsWithColumn[0]) || [];
    const isNumerical = firstEvalData.length > 0 && isNumericalColumn(firstEvalData, columnName);
    
    // Prepare combined data
    let chartData: any[] = [];
    
    if (isNumerical) {
        // For numerical data, create histogram data for each evaluation that has this column
        const allHistograms = new Map<string, any[]>();
        evaluationsWithColumn.forEach(evalName => {
            const data = evaluationsData.get(evalName) || [];
            allHistograms.set(evalName, prepareHistogramData(data, columnName));
        });
        
        // Combine all histogram ranges
        const allRanges = new Set<string>();
        allHistograms.forEach(histogram => {
            histogram.forEach(bin => allRanges.add(bin.range));
        });
        
        // Create combined data structure
        const sortedRanges = Array.from(allRanges).sort((a, b) => {
            const aNum = parseFloat(a.split('-')[0]);
            const bNum = parseFloat(b.split('-')[0]);
            return aNum - bNum;
        });
        
        chartData = sortedRanges.map(range => {
            const dataPoint: any = { range };
            evaluationsWithColumn.forEach(evalName => {
                const histogram = allHistograms.get(evalName) || [];
                const bin = histogram.find(b => b.range === range);
                dataPoint[evalName] = bin ? bin.count : 0;
            });
            return dataPoint;
        });
    } else {
        // For categorical data, aggregate counts across evaluations that have this column
        const allCategories = new Set<string>();
        const categoryCounts = new Map<string, Map<string, number>>();
        
        evaluationsWithColumn.forEach(evalName => {
            const data = evaluationsData.get(evalName) || [];
            const catData = prepareCategoricalData(data, columnName);
            catData.forEach(({ category, count }) => {
                allCategories.add(category);
                if (!categoryCounts.has(category)) {
                    categoryCounts.set(category, new Map());
                }
                categoryCounts.get(category)!.set(evalName, count);
            });
        });
        
        // Create combined data structure
        chartData = Array.from(allCategories).map(category => {
            const dataPoint: any = { category };
            evaluationsWithColumn.forEach(evalName => {
                const counts = categoryCounts.get(category);
                dataPoint[evalName] = counts?.get(evalName) || 0;
            });
            return dataPoint;
        }).sort((a, b) => {
            // Sort by total count
            const aTotal = evaluationsWithColumn.reduce((sum, name) => sum + (a[name] || 0), 0);
            const bTotal = evaluationsWithColumn.reduce((sum, name) => sum + (b[name] || 0), 0);
            return bTotal - aTotal;
        });
    }
    
    if (chartData.length === 0) {
        return (
            <div 
                className={cn(
                    "bg-white border flex flex-col",
                    isRightColumn && "md:-ml-[1px]",
                    index > 0 && "-mt-[1px] md:mt-0",
                    !isFirstRow && "md:-mt-[1px]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                    {(onEdit || onDelete) && (
                        <div className={cn(
                            "flex items-center gap-1 transition-opacity",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Edit graph"
                                >
                                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Delete graph"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }
    
    // Extract solid colors from gradients for evaluations that have this column
    const solidColors = filteredColors.map(gradient => {
        // Extract the first color from the gradient
        const match = gradient.match(/#[0-9a-f]{6}/i);
        return match ? match[0] : '#8b7fff';
    });
    
    return (
        <div 
            className={cn(
                "bg-white border flex flex-col",
                isRightColumn && "md:-ml-[1px]",
                index > 0 && "-mt-[1px] md:mt-0",
                !isFirstRow && "md:-mt-[1px]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                {(onEdit || onDelete) && (
                    <div className={cn(
                        "flex items-center gap-1 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-1 hover:bg-hover rounded transition-colors"
                                title="Edit graph"
                            >
                                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-1 hover:bg-hover rounded transition-colors"
                                title="Delete graph"
                            >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="border-t border-border" />
            
            <div className="h-[240px] px-4 py-4">
                <ResponsiveContainer width="100%" height="100%">
                    {isNumerical ? (
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis 
                                type="category" 
                                dataKey="range" 
                                tick={{ fontSize: 10 }}
                                width={80}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithColumn.map((evalName, idx) => (
                                <Bar 
                                    key={evalName}
                                    dataKey={evalName} 
                                    fill={solidColors[idx]} 
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                type="category" 
                                dataKey="category" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis type="number" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithColumn.map((evalName, idx) => (
                                <Bar 
                                    key={evalName}
                                    dataKey={evalName} 
                                    fill={solidColors[idx]} 
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Custom Metric Chart Component
interface CustomMetricChartProps {
    metric: {
        id: string;
        name: string;
        columnMappings: Map<string, string>;
    };
    evaluationsData: Map<string, EvaluationData[]>;
    evaluationNames: string[];
    evaluationColors: string[];
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

const CustomMetricChart: React.FC<CustomMetricChartProps> = ({
    metric,
    evaluationsData,
    evaluationNames,
    evaluationColors,
    index,
    onEdit,
    onDelete
}) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;

    // Get evaluations that have data for their mapped columns
    const evaluationsWithData = Array.from(metric.columnMappings.entries())
        .filter(([evalName, columnName]) => {
            const data = evaluationsData.get(evalName) || [];
            return data.length > 0 && data[0][columnName] !== undefined;
        });

    if (evaluationsWithData.length === 0) {
        return (
            <div 
                className={cn(
                    "bg-white border flex flex-col",
                    isRightColumn && "md:-ml-[1px]",
                    index > 0 && "-mt-[1px] md:mt-0",
                    !isFirstRow && "md:-mt-[1px]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{metric.name}</h3>
                    <div className={cn(
                        "flex items-center gap-1 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        <button
                            onClick={onEdit}
                            className="p-1 hover:bg-hover rounded transition-colors"
                            title="Edit metric"
                        >
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1 hover:bg-hover rounded transition-colors"
                            title="Delete metric"
                        >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                        </button>
                    </div>
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }

    // Determine if data is numerical based on first evaluation's data
    const [firstEvalName, firstColumnName] = evaluationsWithData[0];
    const firstData = evaluationsData.get(firstEvalName) || [];
    const isNumerical = isNumericalColumn(firstData, firstColumnName);

    // Extract solid colors from gradients
    const solidColors = evaluationsWithData.map(([evalName]) => {
        const idx = evaluationNames.indexOf(evalName);
        const gradient = evaluationColors[idx % evaluationColors.length];
        const match = gradient.match(/#[0-9a-f]{6}/i);
        return match ? match[0] : '#8b7fff';
    });

    // Prepare combined data
    let chartData: any[] = [];

    if (isNumerical) {
        // Histogram data
        const allHistograms = new Map<string, any[]>();
        evaluationsWithData.forEach(([evalName, columnName]) => {
            const data = evaluationsData.get(evalName) || [];
            allHistograms.set(evalName, prepareHistogramData(data, columnName));
        });

        // Get all unique ranges
        const allRanges = new Set<string>();
        allHistograms.forEach(histogram => {
            histogram.forEach(bin => allRanges.add(bin.range));
        });

        const sortedRanges = Array.from(allRanges).sort((a, b) => {
            const aNum = parseFloat(a.split('-')[0]);
            const bNum = parseFloat(b.split('-')[0]);
            return aNum - bNum;
        });

        chartData = sortedRanges.map(range => {
            const dataPoint: any = { range };
            evaluationsWithData.forEach(([evalName]) => {
                const histogram = allHistograms.get(evalName) || [];
                const bin = histogram.find(b => b.range === range);
                dataPoint[evalName] = bin ? bin.count : 0;
            });
            return dataPoint;
        });
    } else {
        // Categorical data
        const allCategories = new Set<string>();
        const categoryCounts = new Map<string, Map<string, number>>();

        evaluationsWithData.forEach(([evalName, columnName]) => {
            const data = evaluationsData.get(evalName) || [];
            const catData = prepareCategoricalData(data, columnName);
            catData.forEach(({ category, count }) => {
                allCategories.add(category);
                if (!categoryCounts.has(category)) {
                    categoryCounts.set(category, new Map());
                }
                categoryCounts.get(category)!.set(evalName, count);
            });
        });

        chartData = Array.from(allCategories).map(category => {
            const dataPoint: any = { category };
            evaluationsWithData.forEach(([evalName]) => {
                const counts = categoryCounts.get(category);
                dataPoint[evalName] = counts?.get(evalName) || 0;
            });
            return dataPoint;
        }).sort((a, b) => {
            const aTotal = evaluationsWithData.reduce((sum, [evalName]) => sum + (a[evalName] || 0), 0);
            const bTotal = evaluationsWithData.reduce((sum, [evalName]) => sum + (b[evalName] || 0), 0);
            return bTotal - aTotal;
        });
    }

    return (
        <div 
            className={cn(
                "bg-white border flex flex-col",
                isRightColumn && "md:-ml-[1px]",
                index > 0 && "-mt-[1px] md:mt-0",
                !isFirstRow && "md:-mt-[1px]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{metric.name}</h3>
                <div className={cn(
                    "flex items-center gap-1 transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0"
                )}>
                    <button
                        onClick={onEdit}
                        className="p-1 hover:bg-hover rounded transition-colors"
                        title="Edit metric"
                    >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 hover:bg-hover rounded transition-colors"
                        title="Delete metric"
                    >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                    </button>
                </div>
            </div>
            <div className="border-t border-border" />
            
            <div className="h-[240px] px-4 py-4">
                <ResponsiveContainer width="100%" height="100%">
                    {isNumerical ? (
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis 
                                type="category" 
                                dataKey="range" 
                                tick={{ fontSize: 10 }}
                                width={80}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithData.map(([evalName], idx) => (
                                <Bar 
                                    key={evalName}
                                    dataKey={evalName} 
                                    fill={solidColors[idx]} 
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                type="category" 
                                dataKey="category" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis type="number" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithData.map(([evalName], idx) => (
                                <Bar 
                                    key={evalName}
                                    dataKey={evalName} 
                                    fill={solidColors[idx]} 
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Metrics Chart Component
interface MetricsChartProps {
    columnName: string;
    data: EvaluationData[];
    isNumerical: boolean;
    index: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ columnName, data, isNumerical, index }) => {
    const chartData = isNumerical 
        ? prepareHistogramData(data, columnName)
        : prepareCategoricalData(data, columnName);
    
    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data available
            </div>
        );
    }
    
    const displayName = columnName
        .replace(/^eval_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    
    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;
    
    return (
        <div className={cn(
            "bg-white border flex flex-col",
            // Collapse borders horizontally on desktop for adjacent cards
            isRightColumn && "md:-ml-[1px]",
            // Collapse borders vertically
            // On desktop: collapse after first row
            !isFirstRow && "md:-mt-[1px]",
            // On mobile: collapse after first item
            index > 0 && "-mt-[1px] md:mt-0",
            !isFirstRow && "md:-mt-[1px]"
        )}>
            <h3 className="text-sm font-semibold text-foreground px-4 py-3">{displayName}</h3>
            <div className="border-t border-border" />
            
            <div className="h-[240px] px-4 py-4">
                <ResponsiveContainer width="100%" height="100%">
                    {isNumerical ? (
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis 
                                type="category" 
                                dataKey="range" 
                                tick={{ fontSize: 10 }}
                                width={80}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="count" fill="#8b7fff" radius={[0, 4, 4, 0]} maxBarSize={40} />
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                type="category" 
                                dataKey="category" 
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis type="number" tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="count" fill="#8b7fff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Right Panel Content Component
interface RightPanelContentProps {
    evaluationName: string;
    evaluations: EvaluationMetadata[];
    isGroupsEmptyState?: boolean;
    isCreatingGroup?: boolean;
    selectedGroupEvaluations?: string[];
    groupName?: string;
}

const RightPanelContent: React.FC<RightPanelContentProps> = ({ 
    evaluationName, 
    evaluations, 
    isGroupsEmptyState = false,
    isCreatingGroup = false,
    selectedGroupEvaluations = [],
    groupName = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'data' | 'annotation'>('data');
    const [viewMode, setViewMode] = useState<'compact' | 'normal' | 'expanded'>('normal');
    const [currentPage, setCurrentPage] = useState(1);
    const [tableData, setTableData] = useState<EvaluationData[]>([]);
    const [comparisonData, setComparisonData] = useState<Map<string, EvaluationData[]>>(new Map());
    const [groupActiveTab, setGroupActiveTab] = useState<'metrics' | 'data'>('data');
    const [multiGroupActiveTab, setMultiGroupActiveTab] = useState<'metrics' | 'data'>('data');
    const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
    const [customMetrics, setCustomMetrics] = useState<Array<{
        id: string;
        name: string;
        columnMappings: Map<string, string>; // evalName -> columnName
    }>>(() => {
        // Initialize from localStorage
        try {
            const stored = localStorage.getItem('customMetrics');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map((metric: any) => ({
                    ...metric,
                    columnMappings: new Map(Object.entries(metric.columnMappings))
                }));
            }
        } catch (error) {
            console.error('Error loading custom metrics from localStorage:', error);
        }
        return [];
    });
    const [newMetricName, setNewMetricName] = useState('Untitled Graph');
    const [newMetricColumns, setNewMetricColumns] = useState<Map<string, string>>(new Map());
    const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
    const [hiddenDefaultMetrics, setHiddenDefaultMetrics] = useState<Set<string>>(() => {
        // Initialize from localStorage
        try {
            const stored = localStorage.getItem('hiddenDefaultMetrics');
            if (stored) {
                return new Set(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading hidden metrics from localStorage:', error);
        }
        return new Set();
    });
    const itemsPerPage = 7;
    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    
    const paginatedData = tableData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Get column names from the data
    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    // Load CSV data when evaluation changes
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await loadEvaluationByName(evaluations, evaluationName);
                setTableData(data);
                setCurrentPage(1); // Reset to first page when evaluation changes
            } catch (error) {
                console.error('Error loading evaluation data:', error);
                // Fallback to dummy data if loading fails
                setTableData(dummyTableData);
            }
        };

        if (evaluations.length > 0 && !isCreatingGroup) {
            loadData();
        }
    }, [evaluationName, evaluations, isCreatingGroup]);

    // Load data for selected evaluations in comparison mode
    useEffect(() => {
        const loadComparisonData = async () => {
            if (selectedGroupEvaluations.length === 0) {
                setComparisonData(new Map());
                return;
            }

            const dataMap = new Map<string, EvaluationData[]>();
            
            for (const evalName of selectedGroupEvaluations) {
                try {
                    const data = await loadEvaluationByName(evaluations, evalName);
                    dataMap.set(evalName, data);
                } catch (error) {
                    console.error(`Error loading data for ${evalName}:`, error);
                }
            }
            
            setComparisonData(dataMap);
            setCurrentPage(1);
        };

        loadComparisonData();
    }, [selectedGroupEvaluations, evaluations]);

    // Auto-generate metric name when columns are selected
    useEffect(() => {
        if (isAddMetricModalOpen && !editingMetricId && newMetricColumns.size > 0 && !newMetricName) {
            // Use the first selected column as the base name
            const firstColumn = Array.from(newMetricColumns.values())[0];
            const displayName = firstColumn
                .replace(/^eval_/, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            setNewMetricName(displayName);
        }
    }, [newMetricColumns, isAddMetricModalOpen, editingMetricId, newMetricName]);

    // Save customMetrics to localStorage whenever it changes
    useEffect(() => {
        try {
            const serialized = customMetrics.map(metric => ({
                ...metric,
                columnMappings: Object.fromEntries(metric.columnMappings)
            }));
            localStorage.setItem('customMetrics', JSON.stringify(serialized));
        } catch (error) {
            console.error('Error saving custom metrics to localStorage:', error);
        }
    }, [customMetrics]);

    // Save hiddenDefaultMetrics to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('hiddenDefaultMetrics', JSON.stringify(Array.from(hiddenDefaultMetrics)));
        } catch (error) {
            console.error('Error saving hidden metrics to localStorage:', error);
        }
    }, [hiddenDefaultMetrics]);

    // Render modal component (defined early so it's available in all return paths)
    const renderModal = () => {
        if (!isAddMetricModalOpen) {
            return null;
        }
        return createPortal(
            <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
                onClick={() => setIsAddMetricModalOpen(false)}
            >
                <div 
                    className="bg-white rounded-xl w-[624px] flex flex-col gap-4 p-6"
                    style={{
                        boxShadow: '0px 12px 32px -16px rgba(0, 0, 0, 0.3), 0px 12px 60px 0px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start gap-2 w-full">
                        <div className="flex-1 flex flex-col gap-1">
                            <h2 className="text-2xl font-medium leading-[30px] text-[#19202f] tracking-[-0.1px]">
                                {editingMetricId ? 'Edit Graph' : 'Add Graph'}
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                setIsAddMetricModalOpen(false);
                                setEditingMetricId(null);
                                setNewMetricName('Untitled Graph');
                                setNewMetricColumns(new Map());
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Graph Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-normal leading-5 text-[#19202f]">
                            Graph Title
                        </label>
                        <input
                            type="text"
                            value={newMetricName}
                            onChange={(e) => setNewMetricName(e.target.value)}
                            placeholder="Untitled Graph"
                            className="w-full h-8 px-2 text-sm leading-5 border border-[#c5cfe4] rounded bg-[rgba(255,255,255,0.9)] text-[#19202f] focus:outline-none focus:ring-2 focus:ring-[#714dff]/20 focus:border-[#714dff]"
                        />
                    </div>

                    {/* Column Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-normal leading-5 text-[#19202f]">
                            Select Columns
                        </label>
                        
                        <div className="flex flex-col">
                            {selectedGroupEvaluations.map((evalName, index) => {
                                const data = comparisonData.get(evalName) || [];
                                const columns = data.length > 0 ? Object.keys(data[0]) : [];
                                
                                // Define color palette matching Figma
                                const evaluationColors = [
                                    'linear-gradient(to right, #8b7fff, #6257ff)', // Purple
                                    'linear-gradient(to right, #63e6be, #20c997)', // Teal/cyan
                                    'linear-gradient(to right, #ffb347, #ff8c42)', // Orange
                                    'linear-gradient(to right, #ff7fcc, #c4348b)', // Pink
                                ];
                                
                                return (
                                    <div key={evalName}>
                                        {index === 0 && (
                                            <div className="h-px w-full bg-[#e9ecef]" />
                                        )}
                                        {index > 0 && (
                                            <div className="h-px w-full bg-[#e9ecef]" />
                                        )}
                                        <div className="flex items-center gap-2 py-2 w-full">
                                            <div className="flex items-center gap-1 flex-1">
                                                <div 
                                                    className="w-[18px] h-[18px] rounded-sm shrink-0"
                                                    style={{ background: evaluationColors[index % evaluationColors.length] }}
                                                />
                                                <span className="text-sm font-normal leading-5 text-[#19202f] pl-1">
                                                    {evalName}
                                                </span>
                                            </div>
                                            <select
                                                value={newMetricColumns.get(evalName) || ''}
                                                onChange={(e) => {
                                                    const newMap = new Map(newMetricColumns);
                                                    if (e.target.value) {
                                                        newMap.set(evalName, e.target.value);
                                                    } else {
                                                        newMap.delete(evalName);
                                                    }
                                                    setNewMetricColumns(newMap);
                                                }}
                                                className="flex-1 h-8 px-2 text-sm leading-5 border border-[#c5cfe4] rounded bg-white text-[#19202f] focus:outline-none focus:ring-2 focus:ring-[#714dff]/20 focus:border-[#714dff]"
                                            >
                                                <option value="">Select Column...</option>
                                                {columns.map((col) => (
                                                    <option key={col} value={col}>
                                                        {col}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedGroupEvaluations.length > 0 && (
                                <div className="h-px w-full bg-[#e9ecef]" />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 w-full">
                        <button
                            onClick={() => {
                                setIsAddMetricModalOpen(false);
                                setEditingMetricId(null);
                                setNewMetricName('Untitled Graph');
                                setNewMetricColumns(new Map());
                            }}
                            className="h-8 px-3 text-sm font-semibold text-[#5b6579] rounded hover:bg-gray-100 transition-colors leading-5 tracking-[-0.16px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (newMetricName.trim() && newMetricColumns.size > 0) {
                                    if (editingMetricId) {
                                        // Check if editing a default metric (column name) or custom metric (numeric ID)
                                        const existingCustomMetric = customMetrics.find(m => m.id === editingMetricId);
                                        
                                        if (existingCustomMetric) {
                                            // Update existing custom metric
                                            setCustomMetrics(customMetrics.map(m => 
                                                m.id === editingMetricId 
                                                    ? { ...m, name: newMetricName, columnMappings: new Map(newMetricColumns) }
                                                    : m
                                            ));
                                        } else {
                                            // Converting a default metric to custom - hide the default and create new custom
                                            setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, editingMetricId]));
                                            setCustomMetrics([...customMetrics, {
                                                id: Date.now().toString(),
                                                name: newMetricName,
                                                columnMappings: new Map(newMetricColumns)
                                            }]);
                                        }
                                    } else {
                                        // Add new metric
                                        setCustomMetrics([...customMetrics, {
                                            id: Date.now().toString(),
                                            name: newMetricName,
                                            columnMappings: new Map(newMetricColumns)
                                        }]);
                                    }
                                    setIsAddMetricModalOpen(false);
                                    setEditingMetricId(null);
                                    setNewMetricName('Untitled Graph');
                                    setNewMetricColumns(new Map());
                                }
                            }}
                            disabled={!newMetricName.trim() || newMetricColumns.size === 0}
                            className={cn(
                                "h-8 px-3 text-sm font-semibold rounded transition-colors leading-5 tracking-[-0.16px]",
                                newMetricName.trim() && newMetricColumns.size > 0
                                    ? "bg-[#714dff] text-white hover:bg-[#5f3dd6]"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {editingMetricId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // Show empty state when in groups tab or when creating group with no selections
    if (isGroupsEmptyState || (isCreatingGroup && selectedGroupEvaluations.length === 0)) {
        return (
            <>
                <div className="flex items-center justify-center flex-1 h-full border-l border-border bg-white overflow-hidden">
                    <p className="text-sm text-muted-foreground">No dataset selected</p>
                </div>
                {renderModal()}
            </>
        );
    }

    // Show comparison view when evaluations are selected (either creating/editing or viewing a group)
    if (selectedGroupEvaluations.length > 0) {
        // Define color palette for evaluations (same for single and multi views)
        const evaluationColors = [
            'linear-gradient(to right, #8b7fff, #6257ff)', // Purple
            'linear-gradient(to right, #63e6be, #20c997)', // Teal/cyan
            'linear-gradient(to right, #ffb347, #ff8c42)', // Orange
            'linear-gradient(to right, #ff7fcc, #c4348b)', // Pink
            'linear-gradient(to right, #87ceeb, #4682b4)', // Sky blue
            'linear-gradient(to right, #98d8c8, #6bcf7f)', // Green
            'linear-gradient(to right, #f6ad55, #ed8936)', // Amber
            'linear-gradient(to right, #b794f6, #9f7aea)', // Lavender
        ];

        // Single evaluation view
        if (selectedGroupEvaluations.length === 1) {
            const singleEvalData = comparisonData.get(selectedGroupEvaluations[0]) || [];
            const singleColumns = singleEvalData.length > 0 ? Object.keys(singleEvalData[0]) : [];
            const singlePaginatedData = singleEvalData.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            );
            const singleTotalPages = Math.ceil(singleEvalData.length / itemsPerPage);

            return (
                <>
                <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-border shrink-0 overflow-hidden">
                        <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden gap-4">
                            <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
                                {groupName || 'Evaluation Group'}
                            </h2>
                            {/* Color Legend */}
                            <div className="flex gap-4 items-center overflow-x-auto">
                                {selectedGroupEvaluations.map((evalName, index) => (
                                    <div key={evalName} className="flex items-center gap-1 shrink-0">
                                        <div 
                                            className="w-4 h-4 rounded-sm shrink-0"
                                            style={{ background: evaluationColors[index % evaluationColors.length] }}
                                        />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {evalName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                            <button
                                onClick={() => setGroupActiveTab('metrics')}
                                className={cn(
                                    "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                    groupActiveTab === 'metrics'
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                Metrics
                                {groupActiveTab === 'metrics' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                                )}
                            </button>
                            <button
                                onClick={() => setGroupActiveTab('data')}
                                className={cn(
                                    "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                    groupActiveTab === 'data'
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                Data
                                {groupActiveTab === 'data' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Toolbar - Only show for Data tab */}
                    {groupActiveTab === 'data' && (
                    <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                                    <List className="w-3 h-3" />
                                    Columns
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Tab Content */}
                    {groupActiveTab === 'metrics' ? (
                        // Metrics View
                        <div className="flex-1 overflow-y-auto">
                            {(() => {
                                const evalColumns = singleColumns.filter(col => col.startsWith('eval_') && !hiddenDefaultMetrics.has(col));
                                const totalMetrics = evalColumns.length + customMetrics.length;
                                
                                if (totalMetrics === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <p className="text-muted-foreground">No metrics to display</p>
                                        </div>
                                    );
                                }
                                
                                let chartIndex = 0;
                                
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        {evalColumns.map((column) => (
                                            <GroupMetricsChart
                                                key={column}
                                                columnName={column}
                                                evaluationsData={comparisonData}
                                                evaluationNames={selectedGroupEvaluations}
                                                evaluationColors={evaluationColors}
                                                index={chartIndex++}
                                                onEdit={() => {
                                                    // Convert default metric to custom metric
                                                    const displayName = column
                                                        .replace(/^eval_/, '')
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, l => l.toUpperCase());
                                                    
                                                    // Create column mappings for all selected evaluations
                                                    const columnMappings = new Map<string, string>();
                                                    selectedGroupEvaluations.forEach(evalName => {
                                                        const data = comparisonData.get(evalName) || [];
                                                        if (data.length > 0 && data[0][column] !== undefined) {
                                                            columnMappings.set(evalName, column);
                                                        }
                                                    });
                                                    
                                                    setNewMetricName(displayName);
                                                    setNewMetricColumns(columnMappings);
                                                    setEditingMetricId(column); // Use column name as temp ID
                                                    setIsAddMetricModalOpen(true);
                                                }}
                                                onDelete={() => {
                                                    setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, column]));
                                                }}
                                            />
                                        ))}
                                        
                                        {/* Custom Metrics */}
                                        {customMetrics.map((metric) => (
                                            <CustomMetricChart
                                                key={metric.id}
                                                metric={metric}
                                                evaluationsData={comparisonData}
                                                evaluationNames={selectedGroupEvaluations}
                                                evaluationColors={evaluationColors}
                                                index={chartIndex++}
                                                onEdit={() => {
                                                    setEditingMetricId(metric.id);
                                                    setNewMetricName(metric.name);
                                                    setNewMetricColumns(new Map(metric.columnMappings));
                                                    setIsAddMetricModalOpen(true);
                                                }}
                                                onDelete={() => {
                                                    setCustomMetrics(customMetrics.filter(m => m.id !== metric.id));
                                                }}
                                            />
                                        ))}
                                        
                                        {/* Add Metric Button */}
                                        <button
                                            onClick={() => setIsAddMetricModalOpen(true)}
                                            type="button"
                                            className={cn(
                                                "bg-white border flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[#fafbff]",
                                                chartIndex % 2 === 1 && "md:-ml-[1px]",
                                                chartIndex > 0 && "-mt-[1px] md:mt-0",
                                                chartIndex >= 2 && "md:-mt-[1px]"
                                            )}
                                            style={{ minHeight: '291px' }}
                                        >
                                            <Plus className="w-6 h-6 text-[#613ee0] mb-2" />
                                            <span className="text-sm font-medium text-[#613ee0]">Add Graph</span>
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                    // Data Table View
                    <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                            <div className="border border-border rounded flex flex-col h-full min-h-0">
                                {singlePaginatedData.length > 0 ? (
                                    <>
                                        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                            <div className="inline-block min-w-full">
                                                <table className="border-collapse">
                                                    <thead className="sticky top-0 z-10">
                                                        <tr className="bg-[#f7faff] border-b border-border">
                                                            {singleColumns.map((column, index) => (
                                                                <th 
                                                                    key={column} 
                                                                    className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap"
                                                                    style={{ 
                                                                        width: index === 0 ? '120px' : '200px',
                                                                        minWidth: index === 0 ? '120px' : '200px',
                                                                        maxWidth: '320px'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="overflow-hidden text-ellipsis">
                                                                            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                        </span>
                                                                        <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {singlePaginatedData.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="border-b border-border last:border-b-0">
                                                                {singleColumns.map((column, colIndex) => (
                                                                    <td 
                                                                        key={column} 
                                                                        className="px-2 py-2 text-sm align-top"
                                                                        style={{ 
                                                                            width: colIndex === 0 ? '120px' : '200px',
                                                                            minWidth: colIndex === 0 ? '120px' : '200px',
                                                                            maxWidth: '320px',
                                                                            maxHeight: '100px'
                                                                        }}
                                                                    >
                                                                        <div className="overflow-hidden" style={{ 
                                                                            maxHeight: '100px',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 4,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word'
                                                                        }}>
                                                                            {row[column] || ''}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                                            <div className="flex items-center gap-0 min-w-0">
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsLeft className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-3 h-3" />
                                                </button>
                                                {Array.from({ length: Math.min(singleTotalPages, 6) }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                                            currentPage === page
                                                                ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                                : "hover:bg-hover"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(singleTotalPages, prev + 1))}
                                                    disabled={currentPage === singleTotalPages}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(singleTotalPages)}
                                                    disabled={currentPage === singleTotalPages}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, singleEvalData.length)} of {singleEvalData.length}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p>No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                {renderModal()}
                </>
            );
        }

        // Multi-evaluation comparison view
        // Get columns for each evaluation in order
        const evalColumns = new Map<string, string[]>();
        for (const evalName of selectedGroupEvaluations) {
            const data = comparisonData.get(evalName) || [];
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            evalColumns.set(evalName, columns);
        }

        // Find the maximum number of columns across all evaluations
        const maxColumnCount = Math.max(...Array.from(evalColumns.values()).map(cols => cols.length));

        // Create interleaved columns: position by position across evaluations
        const interleavedColumns: Array<{ evalName: string; columnName: string | null }> = [];
        
        for (let colIndex = 0; colIndex < maxColumnCount; colIndex++) {
            for (const evalName of selectedGroupEvaluations) {
                const columns = evalColumns.get(evalName) || [];
                // Add column if it exists at this position, otherwise null (will be handled later)
                if (colIndex < columns.length) {
                    interleavedColumns.push({ 
                        evalName, 
                        columnName: columns[colIndex] 
                    });
                }
            }
        }

        // Add remaining columns from evaluations that have more columns
        // These are already included in the loop above, so we don't need additional logic

        // Get max row count across all datasets
        const maxRows = Math.max(...Array.from(comparisonData.values()).map(data => data.length));
        const comparisonTotalPages = Math.ceil(maxRows / itemsPerPage);
        const startRow = (currentPage - 1) * itemsPerPage;
        const endRow = Math.min(currentPage * itemsPerPage, maxRows);
        
        // Get common eval_ columns across all evaluations
        const commonEvalColumns = (() => {
            const allEvalColumns = Array.from(comparisonData.values())
                .map(data => data.length > 0 ? Object.keys(data[0]).filter(col => col.startsWith('eval_')) : []);
            
            if (allEvalColumns.length === 0) return [];
            
            // Find columns that appear in at least one evaluation
            const columnSet = new Set<string>();
            allEvalColumns.forEach(cols => cols.forEach(col => columnSet.add(col)));
            
            return Array.from(columnSet).sort();
        })();

        return (
            <>
            <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
                {/* Header */}
                <div className="border-b border-border shrink-0 overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden gap-4">
                        <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
                            {groupName || 'Evaluation Group'}
                        </h2>
                        {/* Color Legend */}
                        <div className="flex gap-4 items-center overflow-x-auto">
                            {selectedGroupEvaluations.map((evalName, index) => (
                                <div key={evalName} className="flex items-center gap-1 shrink-0">
                                    <div 
                                        className="w-4 h-4 rounded-sm shrink-0"
                                        style={{ background: evaluationColors[index % evaluationColors.length] }}
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {evalName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                        <button
                            onClick={() => setMultiGroupActiveTab('metrics')}
                            className={cn(
                                "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                multiGroupActiveTab === 'metrics'
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            Metrics
                            {multiGroupActiveTab === 'metrics' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                            )}
                        </button>
                        <button
                            onClick={() => setMultiGroupActiveTab('data')}
                            className={cn(
                                "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                multiGroupActiveTab === 'data'
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            Data
                            {multiGroupActiveTab === 'data' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Toolbar - Only show for Data tab */}
                {multiGroupActiveTab === 'data' && (
                <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 items-center">
                            <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                                <List className="w-3 h-3" />
                                Columns
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Tab Content */}
                {multiGroupActiveTab === 'metrics' ? (
                    // Metrics View
                    <div className="flex-1 overflow-y-auto">
                        {(() => {
                            const visibleCommonColumns = commonEvalColumns.filter(col => !hiddenDefaultMetrics.has(col));
                            const totalMetrics = visibleCommonColumns.length + customMetrics.length;
                            
                            if (totalMetrics === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <p className="text-muted-foreground">No metrics to display</p>
                                    </div>
                                );
                            }
                            
                            let chartIndex = 0;
                            
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {visibleCommonColumns.map((column) => (
                                        <GroupMetricsChart
                                            key={column}
                                            columnName={column}
                                            evaluationsData={comparisonData}
                                            evaluationNames={selectedGroupEvaluations}
                                            evaluationColors={evaluationColors}
                                            index={chartIndex++}
                                            onEdit={() => {
                                                // Convert default metric to custom metric
                                                const displayName = column
                                                    .replace(/^eval_/, '')
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, l => l.toUpperCase());
                                                
                                                // Create column mappings for all selected evaluations
                                                const columnMappings = new Map<string, string>();
                                                selectedGroupEvaluations.forEach(evalName => {
                                                    const data = comparisonData.get(evalName) || [];
                                                    if (data.length > 0 && data[0][column] !== undefined) {
                                                        columnMappings.set(evalName, column);
                                                    }
                                                });
                                                
                                                setNewMetricName(displayName);
                                                setNewMetricColumns(columnMappings);
                                                setEditingMetricId(column); // Use column name as temp ID
                                                setIsAddMetricModalOpen(true);
                                            }}
                                            onDelete={() => {
                                                setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, column]));
                                            }}
                                        />
                                    ))}
                                    
                                    {/* Custom Metrics */}
                                    {customMetrics.map((metric) => (
                                        <CustomMetricChart
                                            key={metric.id}
                                            metric={metric}
                                            evaluationsData={comparisonData}
                                            evaluationNames={selectedGroupEvaluations}
                                            evaluationColors={evaluationColors}
                                            index={chartIndex++}
                                            onEdit={() => {
                                                setEditingMetricId(metric.id);
                                                setNewMetricName(metric.name);
                                                setNewMetricColumns(new Map(metric.columnMappings));
                                                setIsAddMetricModalOpen(true);
                                            }}
                                            onDelete={() => {
                                                setCustomMetrics(customMetrics.filter(m => m.id !== metric.id));
                                            }}
                                        />
                                    ))}
                                    
                                    {/* Add Metric Button */}
                                    <button
                                        onClick={() => setIsAddMetricModalOpen(true)}
                                        type="button"
                                        className={cn(
                                            "bg-white border flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[#fafbff]",
                                            chartIndex % 2 === 1 && "md:-ml-[1px]",
                                            chartIndex > 0 && "-mt-[1px] md:mt-0",
                                            chartIndex >= 2 && "md:-mt-[1px]"
                                        )}
                                        style={{ minHeight: '291px' }}
                                    >
                                        <Plus className="w-6 h-6 text-[#613ee0] mb-2" />
                                        <span className="text-sm font-medium text-[#613ee0]">Add Graph</span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                // Comparison Table
                <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                    <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                        <div className="border border-border rounded flex flex-col h-full min-h-0">
                            {interleavedColumns.length > 0 ? (
                                <>
                                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                        <div className="inline-block min-w-full">
                                            <table className="border-collapse">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-[#f7faff] border-b border-border">
                                                        {interleavedColumns.map((col, index) => {
                                                            const evalIndex = selectedGroupEvaluations.indexOf(col.evalName);
                                                            const colorGradient = evaluationColors[evalIndex % evaluationColors.length];
                                                            
                                                            return (
                                                                <th 
                                                                    key={`${col.evalName}-${col.columnName}-${index}`}
                                                                    className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap border-r border-border last:border-r-0"
                                                                    style={{ 
                                                                        width: '200px',
                                                                        minWidth: '200px',
                                                                        maxWidth: '320px'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        {/* Colored chip */}
                                                                        <div 
                                                                            className="w-4 h-4 rounded-sm shrink-0"
                                                                            style={{ background: colorGradient }}
                                                                        />
                                                                        {/* Column name */}
                                                                        <span className="flex-1 overflow-hidden text-ellipsis">
                                                                            {col.columnName ? col.columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                                                                        </span>
                                                                        {/* Sort icon */}
                                                                        <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                                    </div>
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.from({ length: endRow - startRow }, (_, rowIndex) => {
                                                        const actualRowIndex = startRow + rowIndex;
                                                        return (
                                                            <tr key={actualRowIndex} className="border-b border-border last:border-b-0">
                                                                {interleavedColumns.map((col, colIndex) => {
                                                                    const evalData = comparisonData.get(col.evalName) || [];
                                                                    const row = evalData[actualRowIndex];
                                                                    const cellValue = (row && col.columnName) ? row[col.columnName] : '';
                                                                    
                                                                    return (
                                                                        <td 
                                                                            key={`${col.evalName}-${col.columnName}-${colIndex}`}
                                                                            className="px-2 py-2 text-sm align-top border-r border-border last:border-r-0"
                                                                            style={{ 
                                                                                width: '200px',
                                                                                minWidth: '200px',
                                                                                maxWidth: '320px',
                                                                                maxHeight: '100px'
                                                                            }}
                                                                        >
                                                                            <div className="overflow-hidden" style={{ 
                                                                                maxHeight: '100px',
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 4,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                wordBreak: 'break-word'
                                                                            }}>
                                                                                {cellValue || ''}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                                        <div className="flex items-center gap-0 min-w-0">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsLeft className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-3 h-3" />
                                            </button>
                                            {Array.from({ length: Math.min(comparisonTotalPages, 6) }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                                        currentPage === page
                                                            ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                            : "hover:bg-hover"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(comparisonTotalPages, prev + 1))}
                                                disabled={currentPage === comparisonTotalPages}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(comparisonTotalPages)}
                                                disabled={currentPage === comparisonTotalPages}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                Showing {startRow + 1}-{endRow} of {maxRows}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </div>
            {renderModal()}
            </>
        );
    }

    return (
        <>
        <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-border shrink-0 overflow-hidden">
                {/* Title and Actions */}
                <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden">
                    <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                        {evaluationName}
                    </h2>
                    <button className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-[#613ee0] hover:bg-hover rounded shrink-0 ml-4">
                        <RefreshCw className="w-4 h-4" />
                        Rerun
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'overview'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Overview
                        {activeTab === 'overview' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('metrics')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'metrics'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Metrics
                        {activeTab === 'metrics' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'data'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Data
                        {activeTab === 'data' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('annotation')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'annotation'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Annotation tasks
                        {activeTab === 'annotation' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Toolbar Section - Only show for Data tab */}
            {activeTab === 'data' && (
            <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                <div className="flex items-center justify-between">
                    {/* Left side - Filter, Search, Download */}
                    <div className="flex gap-1 items-center">
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right side - Columns and View Toggle */}
                    <div className="flex gap-2 items-center">
                        <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                            <List className="w-3 h-3" />
                            Columns
                        </button>
                        <div className="flex items-center h-6 bg-white border border-border rounded">
                            <button
                                onClick={() => setViewMode('compact')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full rounded-l px-4 text-sm",
                                    viewMode === 'compact'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <Grid3x3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('normal')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full px-4 text-sm",
                                    viewMode === 'normal'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <Grid2x2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('expanded')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full rounded-r px-4 text-sm",
                                    viewMode === 'expanded'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Tab Content */}
            {activeTab === 'metrics' ? (
                // Metrics View
                <div className="flex-1 overflow-y-auto">
                    {(() => {
                        // Get columns that start with "eval_"
                        const evalColumns = columns.filter(col => col.startsWith('eval_'));
                        
                        if (evalColumns.length === 0) {
                            return (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No evaluation metrics found</p>
                                </div>
                            );
                        }
                        
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {evalColumns.map((column, index) => (
                                    <MetricsChart
                                        key={column}
                                        columnName={column}
                                        data={tableData}
                                        isNumerical={isNumericalColumn(tableData, column)}
                                        index={index}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>
            ) : (
                // Data Table View
            <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                {/* Padded container */}
                <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                    <div className="border border-border rounded flex flex-col h-full min-h-0">
                        {paginatedData.length > 0 ? (
                            <>
                                {/* Scrollable table area - both horizontal and vertical */}
                                <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                    <div className="inline-block min-w-full">
                                        <table className="border-collapse">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-[#f7faff] border-b border-border">
                                                    {columns.map((column, index) => (
                                                        <th 
                                                            key={column} 
                                                            className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap"
                                                            style={{ 
                                                                width: index === 0 ? '120px' : '200px',
                                                                minWidth: index === 0 ? '120px' : '200px',
                                                                maxWidth: '320px'
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span className="overflow-hidden text-ellipsis">
                                                                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                                <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b border-border last:border-b-0" style={{ maxHeight: '100px' }}>
                                                        {columns.map((column, colIndex) => (
                                                            <td 
                                                                key={column} 
                                                                className="px-2 py-2 text-sm align-top"
                                                                style={{ 
                                                                    width: colIndex === 0 ? '120px' : '200px',
                                                                    minWidth: colIndex === 0 ? '120px' : '200px',
                                                                    maxWidth: '320px',
                                                                    maxHeight: '100px'
                                                                }}
                                                            >
                                                                <div className="overflow-hidden" style={{ 
                                                                    maxHeight: '100px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 4,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {row[column] || ''}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Fixed Pagination */}
                                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                        <div className="flex items-center gap-0 min-w-0">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsLeft className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                        currentPage === page
                                            ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                            : "hover:bg-hover"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            {totalPages > 7 && (
                                <>
                                    <div className="flex items-center justify-center w-6 h-6 text-sm text-muted-foreground">
                                        ...
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className={cn(
                                            "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                            currentPage === totalPages
                                                ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                : "hover:bg-hover"
                                        )}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                            <ChevronsRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}
        </div>
        {renderModal()}
        </>
    );
};

const CompareEvals: React.FC = () => {
    // Register config and get access to values
    usePrototypeConfig(compareEvalsConfig);
    const [selectedEvaluation, setSelectedEvaluation] = useState('Evaluation name');
    const [evaluations, setEvaluations] = useState<EvaluationMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedGroupEvaluations, setSelectedGroupEvaluations] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');
    const [savedGroups, setSavedGroups] = useState<EvaluationGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<EvaluationGroup | null>(null);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [groupsLoaded, setGroupsLoaded] = useState(false);
    
    // Load evaluations metadata and groups on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load evaluations
                const data = await loadEvaluationMetadata();
                setEvaluations(data);
                // Set the first evaluation as selected if available
                if (data.length > 0) {
                    setSelectedEvaluation(data[0].name);
                }
                
                // Load saved groups from localStorage
                const storedGroups = loadEvaluationGroupsFromLocalStorage();
                setSavedGroups(storedGroups);
                setGroupsLoaded(true);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Save groups to localStorage whenever they change (but not on initial load)
    useEffect(() => {
        if (groupsLoaded) {
            saveEvaluationGroups(savedGroups);
        }
    }, [savedGroups, groupsLoaded]);

    if (loading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <div className="text-muted-foreground">Loading evaluations...</div>
            </div>
        );
    }

    // Handler for saving a new group
    const handleSaveGroup = (group: EvaluationGroup) => {
        setSavedGroups(prev => [...prev, group]);
        setSelectedGroup(group);
        // Keep the group's comparison view
        setSelectedGroupEvaluations(group.evaluations);
        setGroupName(group.name);
        // Close the creation form but stay in groups tab
        setIsCreatingGroup(false);
        setActiveTab('groups');
    };

    // Handler for selecting a single evaluation
    const handleSelectEvaluation = (name: string) => {
        setSelectedEvaluation(name);
        // Clear group selections so single evaluation view shows
        setSelectedGroup(null);
        setSelectedGroupEvaluations([]);
        setGroupName('');
    };

    // Handler for selecting a group
    const handleSelectGroup = (group: EvaluationGroup) => {
        setSelectedGroup(group);
        setSelectedGroupEvaluations(group.evaluations);
        setGroupName(group.name);
    };

    // Handler for deleting a group
    const handleDeleteGroup = (id: string) => {
        setSavedGroups(prev => prev.filter(g => g.id !== id));
        if (selectedGroup?.id === id) {
            setSelectedGroup(null);
            setIsCreatingGroup(false);
            setSelectedGroupEvaluations([]);
            setGroupName('');
        }
    };

    // Handler for editing a group
    const handleEditGroup = (group: EvaluationGroup) => {
        setIsCreatingGroup(true);
        setEditingGroupId(group.id);
        setGroupName(group.name);
        setSelectedGroupEvaluations(group.evaluations);
    };

    // Handler for updating an existing group
    const handleUpdateGroup = (updatedGroup: EvaluationGroup) => {
        setSavedGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        setSelectedGroup(updatedGroup);
        setSelectedGroupEvaluations(updatedGroup.evaluations);
        setGroupName(updatedGroup.name);
        setIsCreatingGroup(false);
        setEditingGroupId(null);
        setActiveTab('groups');
    };

    // Handler for creating group or editing changes
    const handleCreatingGroupChange = (isCreating: boolean) => {
        setIsCreatingGroup(isCreating);
        if (!isCreating) {
            setEditingGroupId(null);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col">
            <Navigation />
            <div className="flex flex-1 overflow-hidden min-h-0">
                <SidePanel 
                    selectedEvaluation={selectedEvaluation}
                    onSelectEvaluation={handleSelectEvaluation}
                    evaluations={evaluations}
                    onTabChange={setActiveTab}
                    isCreatingGroup={isCreatingGroup}
                    onCreatingGroupChange={handleCreatingGroupChange}
                    onSelectedEvaluationsChange={setSelectedGroupEvaluations}
                    onGroupNameChange={setGroupName}
                    savedGroups={savedGroups}
                    selectedGroup={selectedGroup}
                    selectedGroupEvaluations={selectedGroupEvaluations}
                    editingGroupId={editingGroupId}
                    groupName={groupName}
                    onSaveGroup={handleSaveGroup}
                    onUpdateGroup={handleUpdateGroup}
                    onSelectGroup={handleSelectGroup}
                    onDeleteGroup={handleDeleteGroup}
                    onEditGroup={handleEditGroup}
                />
                <RightPanelContent 
                    evaluationName={selectedEvaluation}
                    evaluations={evaluations}
                    isGroupsEmptyState={activeTab === 'groups' && selectedGroupEvaluations.length === 0 && savedGroups.length === 0}
                    isCreatingGroup={isCreatingGroup}
                    selectedGroupEvaluations={selectedGroupEvaluations}
                    groupName={groupName}
                />
            </div>
        </div>
    );
};

export const title = 'Compare Evals';
export const route = '/compare-evals';

export default CompareEvals;

