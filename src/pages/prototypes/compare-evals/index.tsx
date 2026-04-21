import React, { useState, useEffect, useLayoutEffect } from 'react';
import { loadEvaluationMetadata, loadEvaluationGroupsFromLocalStorage, saveEvaluationGroups, type EvaluationMetadata, type EvaluationGroup } from '@/utils/csvLoader';
import { combinedCSSVariables } from '@/lib/theme';
import { Navigation } from './Navigation';
import { SidePanel } from './SidePanel';
import { RightPanelContent } from './RightPanelContent';

const FORCE_LIGHT_STYLE_ID = 'force-light-mode';
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

const CompareEvals: React.FC = () => {
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
                    evaluationMetadata={evaluations.find(e => e.name === selectedEvaluation) ?? null}
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
