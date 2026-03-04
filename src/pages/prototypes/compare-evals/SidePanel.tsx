import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, ChevronDown as SortIcon, Tag, Plus, Calendar, Search, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EvaluationMetadata, type EvaluationGroup } from '@/utils/csvLoader';
import { EvaluationCard } from './EvaluationCard';
import { GroupCard } from './GroupCard';

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

export type { SidePanelProps };
export { SidePanel };
