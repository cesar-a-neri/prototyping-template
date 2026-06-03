import React, { useState, useEffect, useLayoutEffect } from 'react';
import { loadEvaluationMetadata, type EvaluationMetadata, type EvaluationGroup } from '@/utils/csvLoader';
import { combinedCSSVariables } from '@/lib/theme';
import { NavV3 } from '../sgp-nav/SgpNav';
import { SidePanel } from './SidePanel';
import { RightPanelContent } from './RightPanelContent';

const FORCE_LIGHT_STYLE_ID = 'force-light-mode-compare-evals-v2';
const GROUPS_STORAGE_KEY = 'evaluation-groups-v2';

let lightStyleSheet: string | null = null;
function getLightStyleSheet() {
    if (!lightStyleSheet) {
        const vars = Object.entries(combinedCSSVariables.light)
            .map(([prop, value]) => `${prop}:${value} !important`)
            .join(';');
        lightStyleSheet = `:root{color-scheme:light !important;${vars}}`;
    }
    return lightStyleSheet;
}

const SAMPLE_GROUP_TEMPLATES: Array<Omit<EvaluationGroup, 'evaluations'>> = [
    { id: 'g-1', name: 'Q3 Regression Suite', createdDate: 'Aug 12 2025', tags: ['regression', 'quarterly'] },
    { id: 'g-2', name: 'Latency Benchmarks', createdDate: 'Sep 03 2025', tags: ['benchmark', 'performance'] },
    { id: 'g-3', name: 'Hallucination Spot Checks', createdDate: 'Oct 21 2025', tags: ['quality', 'qa'] },
    { id: 'g-4', name: 'Tone & Style Audit', createdDate: 'Nov 14 2025', tags: ['style', 'review'] },
];

function loadGroupsFromStorage(): EvaluationGroup[] {
    try {
        const stored = localStorage.getItem(GROUPS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading groups:', error);
    }
    return [];
}

function saveGroupsToStorage(groups: EvaluationGroup[]) {
    try {
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (error) {
        console.error('Error saving groups:', error);
    }
}

const CompareEvalsV2: React.FC = () => {
    useLayoutEffect(() => {
        const style = document.createElement('style');
        style.id = FORCE_LIGHT_STYLE_ID;
        style.textContent = getLightStyleSheet();
        document.head.appendChild(style);
        return () => { style.remove(); };
    }, []);

    const [selectedEvaluation, setSelectedEvaluation] = useState('Evaluation name');
    const [evaluations, setEvaluations] = useState<EvaluationMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'groups'>('all');
    const [savedGroups, setSavedGroups] = useState<EvaluationGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<EvaluationGroup | null>(null);
    const [groupsLoaded, setGroupsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await loadEvaluationMetadata();
                setEvaluations(data);
                if (data.length > 0) {
                    setSelectedEvaluation(data[0].name);
                }

                const stored = loadGroupsFromStorage();
                if (stored.length > 0) {
                    setSavedGroups(stored);
                } else if (data.length > 0) {
                    const seeded = SAMPLE_GROUP_TEMPLATES.map((tpl, i) => ({
                        ...tpl,
                        evaluations: data.slice(i, i + Math.min(3, data.length - i)).map(e => e.name),
                    })).filter(g => g.evaluations.length > 0);
                    setSavedGroups(seeded);
                }
                setGroupsLoaded(true);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (groupsLoaded) {
            saveGroupsToStorage(savedGroups);
        }
    }, [savedGroups, groupsLoaded]);

    if (loading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <div className="text-muted-foreground">Loading evaluations...</div>
            </div>
        );
    }

    const handleSelectEvaluation = (name: string) => {
        setSelectedEvaluation(name);
        setSelectedGroup(null);
    };

    const handleSelectGroup = (group: EvaluationGroup) => {
        setSelectedGroup(group);
    };

    const handleArchiveEvaluations = (names: string[]) => {
        const removed = new Set(names);
        const remaining = evaluations.filter(e => !removed.has(e.name));
        setEvaluations(remaining);
        if (removed.has(selectedEvaluation)) {
            setSelectedEvaluation(remaining[0]?.name ?? '');
        }
    };

    const handleArchiveGroups = (ids: string[]) => {
        const removed = new Set(ids);
        setSavedGroups(prev => prev.filter(g => !removed.has(g.id)));
        if (selectedGroup && removed.has(selectedGroup.id)) {
            setSelectedGroup(null);
        }
    };

    const handleDuplicateAndRerunEvaluations = (names: string[]) => {
        const target = new Set(names);
        const today = new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
        const stamp = Date.now();
        const copies: EvaluationMetadata[] = evaluations
            .filter(e => target.has(e.name))
            .map((e, i) => ({
                ...e,
                id: `${e.id}-copy-${stamp}-${i}`,
                name: `${e.name} (Copy)`,
                date: today,
                dateLabel: 'Created',
            }));
        if (copies.length > 0) {
            setEvaluations(prev => [...copies, ...prev]);
        }
    };

    const handleDuplicateAndRerunGroups = (ids: string[]) => {
        const target = new Set(ids);
        const today = new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
        const stamp = Date.now();
        const copies: EvaluationGroup[] = savedGroups
            .filter(g => target.has(g.id))
            .map((g, i) => ({
                ...g,
                id: `${g.id}-copy-${stamp}-${i}`,
                name: `${g.name} (Copy)`,
                createdDate: today,
            }));
        if (copies.length > 0) {
            setSavedGroups(prev => [...copies, ...prev]);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col">
            <NavV3 />
            <div className="flex flex-1 overflow-hidden min-h-0">
                <SidePanel
                    selectedEvaluation={selectedEvaluation}
                    onSelectEvaluation={handleSelectEvaluation}
                    evaluations={evaluations}
                    onTabChange={setActiveTab}
                    savedGroups={savedGroups}
                    selectedGroup={selectedGroup}
                    onSelectGroup={handleSelectGroup}
                    onArchiveEvaluations={handleArchiveEvaluations}
                    onArchiveGroups={handleArchiveGroups}
                    onDuplicateAndRerunEvaluations={handleDuplicateAndRerunEvaluations}
                    onDuplicateAndRerunGroups={handleDuplicateAndRerunGroups}
                />
                <RightPanelContent
                    evaluationName={selectedEvaluation}
                    evaluations={evaluations}
                    evaluationMetadata={evaluations.find(e => e.name === selectedEvaluation) ?? null}
                    isGroupsEmptyState={activeTab === 'groups' && !selectedGroup && savedGroups.length === 0}
                    selectedGroupEvaluations={selectedGroup?.evaluations ?? []}
                    groupName={selectedGroup?.name ?? ''}
                />
            </div>
        </div>
    );
};

export const title = 'Compare Evals V2';
export const route = '/compare-evals-v2';

export default CompareEvalsV2;
