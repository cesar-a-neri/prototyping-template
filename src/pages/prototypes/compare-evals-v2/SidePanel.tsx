import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, ChevronDown as SortIcon, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type EvaluationMetadata, type EvaluationGroup } from '@/utils/csvLoader';
import { EvaluationCard } from './EvaluationCard';
import { GroupCard } from './GroupCard';

interface SidePanelProps {
    selectedEvaluation: string;
    onSelectEvaluation: (name: string) => void;
    evaluations: EvaluationMetadata[];
    onTabChange?: (tab: 'all' | 'groups') => void;
    savedGroups?: EvaluationGroup[];
    selectedGroup?: EvaluationGroup | null;
    onSelectGroup?: (group: EvaluationGroup) => void;
    onArchiveEvaluations?: (names: string[]) => void;
    onArchiveGroups?: (ids: string[]) => void;
    onDuplicateAndRerunEvaluations?: (names: string[]) => void;
    onDuplicateAndRerunGroups?: (ids: string[]) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
    selectedEvaluation,
    onSelectEvaluation,
    evaluations,
    onTabChange,
    savedGroups = [],
    selectedGroup,
    onSelectGroup,
    onArchiveEvaluations,
    onArchiveGroups,
    onDuplicateAndRerunEvaluations,
    onDuplicateAndRerunGroups,
}) => {
    const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
    const [searchValue, setSearchValue] = useState('');
    const [groupSearchValue, setGroupSearchValue] = useState('');

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedEvalNames, setSelectedEvalNames] = useState<Set<string>>(new Set());
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

    const [pendingArchive, setPendingArchive] = useState<{
        type: 'evaluations' | 'groups';
        items: string[];
    } | null>(null);

    const handleTabChange = (tab: 'all' | 'groups') => {
        setActiveTab(tab);
        onTabChange?.(tab);
        setIsSelectMode(false);
        setSelectedEvalNames(new Set());
        setSelectedGroupIds(new Set());
    };

    const toggleEval = (name: string) => {
        const next = new Set(selectedEvalNames);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        setSelectedEvalNames(next);
    };

    const toggleGroup = (id: string) => {
        const next = new Set(selectedGroupIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedGroupIds(next);
    };

    const handleEnterEvalSelectMode = (initialName: string) => {
        setIsSelectMode(true);
        setSelectedEvalNames(new Set([initialName]));
        setSelectedGroupIds(new Set());
    };

    const handleEnterGroupSelectMode = (initialId: string) => {
        setIsSelectMode(true);
        setSelectedEvalNames(new Set());
        setSelectedGroupIds(new Set([initialId]));
    };

    const handleCancelSelect = () => {
        setIsSelectMode(false);
        setSelectedEvalNames(new Set());
        setSelectedGroupIds(new Set());
    };

    const requestArchiveEvaluations = (names: string[]) => {
        if (names.length === 0) return;
        setPendingArchive({ type: 'evaluations', items: names });
    };

    const requestArchiveGroups = (ids: string[]) => {
        if (ids.length === 0) return;
        setPendingArchive({ type: 'groups', items: ids });
    };

    const confirmArchive = () => {
        if (!pendingArchive) return;
        if (pendingArchive.type === 'evaluations') {
            onArchiveEvaluations?.(pendingArchive.items);
        } else {
            onArchiveGroups?.(pendingArchive.items);
        }
        setPendingArchive(null);
        if (isSelectMode) {
            handleCancelSelect();
        }
    };

    const cancelArchive = () => setPendingArchive(null);

    const handleBulkArchive = () => {
        if (activeTab === 'all') {
            requestArchiveEvaluations(Array.from(selectedEvalNames));
        } else {
            requestArchiveGroups(Array.from(selectedGroupIds));
        }
    };

    const handleBulkDuplicateAndRerun = () => {
        if (activeTab === 'all') {
            onDuplicateAndRerunEvaluations?.(Array.from(selectedEvalNames));
        } else {
            onDuplicateAndRerunGroups?.(Array.from(selectedGroupIds));
        }
        handleCancelSelect();
    };

    const filteredEvaluations = evaluations.filter(evaluation =>
        evaluation.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const filteredGroups = savedGroups.filter(group =>
        group.name.toLowerCase().includes(groupSearchValue.toLowerCase())
    );

    const selectedCount = activeTab === 'all' ? selectedEvalNames.size : selectedGroupIds.size;

    return (
        <div className="w-[430px] h-full bg-white border-r border-border flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6 shrink-0">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-foreground">Evaluations</span>
                    <p className="text-sm text-muted-foreground">
                        Browse and compare existing evaluations
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
                            activeTab === 'all' ? "text-[#2e1e71] font-semibold" : "text-muted-foreground"
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
                            activeTab === 'groups' ? "text-[#2e1e71] font-semibold" : "text-muted-foreground"
                        )}
                    >
                        Groups
                        {activeTab === 'groups' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Search + filter */}
            <div className="px-6 py-4 flex gap-2 items-center shrink-0">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={activeTab === 'all' ? "Search evaluations..." : "Search groups..."}
                        value={activeTab === 'all' ? searchValue : groupSearchValue}
                        onChange={(e) =>
                            activeTab === 'all'
                                ? setSearchValue(e.target.value)
                                : setGroupSearchValue(e.target.value)
                        }
                        className="w-full h-8 pl-9 pr-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f3fd4]/20 focus:border-[#4f3fd4]"
                    />
                </div>
                {activeTab === 'all' && (
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-hover text-muted-foreground hover:text-foreground">
                        <Filter className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Date range + Sort - only on 'all' tab */}
            {activeTab === 'all' && (
                <div className="px-6 pb-4 shrink-0">
                    <div className="flex items-center justify-between">
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

            {/* List */}
            {activeTab === 'groups' ? (
                savedGroups.length > 0 ? (
                    <div className="flex-1 px-6 overflow-y-auto">
                        <div className="flex flex-col gap-2 pb-6">
                            {filteredGroups.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    isSelected={selectedGroup?.id === group.id && !isSelectMode}
                                    onClick={() => {
                                        if (isSelectMode) toggleGroup(group.id);
                                        else onSelectGroup?.(group);
                                    }}
                                    onArchive={() => requestArchiveGroups([group.id])}
                                    onDuplicateAndRerun={() => onDuplicateAndRerunGroups?.([group.id])}
                                    onSelectMultiple={() => handleEnterGroupSelectMode(group.id)}
                                    withCheckbox={isSelectMode}
                                    isChecked={selectedGroupIds.has(group.id)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center overflow-y-auto">
                        <div className="flex flex-col gap-2 items-center max-w-[382px] text-center px-6">
                            <h3 className="text-sm font-medium text-foreground leading-5">
                                No Evaluation Groups Found
                            </h3>
                            <p className="text-sm text-muted-foreground leading-5">
                                Evaluation groups will appear here once created.
                            </p>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex-1 px-6 overflow-y-auto">
                    <div className="flex flex-col gap-2 pb-6">
                        {filteredEvaluations.map((evaluation, index) => (
                            <EvaluationCard
                                key={index}
                                {...evaluation}
                                isHighlighted={evaluation.name === selectedEvaluation && !isSelectMode}
                                onClick={() => {
                                    if (isSelectMode) toggleEval(evaluation.name);
                                    else onSelectEvaluation(evaluation.name);
                                }}
                                withCheckbox={isSelectMode}
                                isChecked={selectedEvalNames.has(evaluation.name)}
                                onCheckChange={() => toggleEval(evaluation.name)}
                                onSelectMultiple={() => handleEnterEvalSelectMode(evaluation.name)}
                                onArchive={() => requestArchiveEvaluations([evaluation.name])}
                                onDuplicateAndRerun={() => onDuplicateAndRerunEvaluations?.([evaluation.name])}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            {isSelectMode ? (
                <div className="border-t border-border bg-[#fbfcff] px-4 py-4 shrink-0 flex items-center justify-between gap-2">
                    <button
                        onClick={handleCancelSelect}
                        className="h-8 px-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded shrink-0"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleBulkDuplicateAndRerun}
                            disabled={selectedCount === 0}
                            className={cn(
                                "h-8 px-3 text-sm font-medium rounded border bg-white",
                                selectedCount > 0
                                    ? "border-border text-foreground hover:bg-hover"
                                    : "border-border text-[rgba(0,42,131,0.31)] cursor-not-allowed"
                            )}
                        >
                            Duplicate and Rerun
                        </button>
                        <button
                            onClick={handleBulkArchive}
                            disabled={selectedCount === 0}
                            className={cn(
                                "h-8 px-3 text-sm font-medium rounded",
                                selectedCount > 0
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-[rgba(0,54,175,0.07)] text-[rgba(0,42,131,0.31)] cursor-not-allowed"
                            )}
                        >
                            Archive
                        </button>
                    </div>
                </div>
            ) : activeTab === 'all' ? (
                <div className="border-t border-border bg-[#fbfcff] px-4 py-6 shrink-0">
                    <button className="w-full h-8 bg-white border border-[#8675ff] text-[#4f3fd4] rounded text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#fafbff]">
                        Create evaluation
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : null}

            {pendingArchive && (
                <div
                    onClick={cancelArchive}
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg shadow-xl border border-border max-w-sm w-full p-6 flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-semibold text-foreground">
                                {pendingArchive.type === 'evaluations'
                                    ? `Archive ${pendingArchive.items.length} ${pendingArchive.items.length === 1 ? 'evaluation' : 'evaluations'}?`
                                    : `Archive ${pendingArchive.items.length} ${pendingArchive.items.length === 1 ? 'group' : 'groups'}?`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Archived items are hidden from this view. You can restore them later from the archive.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={cancelArchive}
                                className="h-8 px-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmArchive}
                                className="h-8 px-3 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export type { SidePanelProps };
export { SidePanel };
