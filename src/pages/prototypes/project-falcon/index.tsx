// Project Falcon — Scale's fleet control plane for SGP deployments.
// Top-level views (Fleet · [Deployments] · Customers) plus two detail
// subpages (Workspace, Customer). Forces light mode + the shadcn/Inter
// design language regardless of the host prototype theme.

import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { combinedCSSVariables } from '@/lib/theme';
import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';
import { useTweakpane } from '@/lib/tweakpane';
import { SHAD_VARS_DARK, SHAD_VARS_LIGHT } from './shared';
import { NavShell, type FalconSection, type NavItem } from './NavShell';
import { FleetOverview } from './FleetOverview';
import { WorkspaceDetail } from './WorkspaceDetail';
import { CustomerCatalog } from './CustomerCatalog';
import { CustomerDetail } from './CustomerDetail';
import { DeploymentSearch } from './DeploymentSearch';
import { FIBrowse } from './FIBrowse';

const FORCE_THEME_STYLE_ID = 'force-theme-project-falcon';
const themeSheetCache: Record<'light' | 'dark', string> = { light: '', dark: '' };
function getThemeStyleSheet(mode: 'light' | 'dark'): string {
    if (!themeSheetCache[mode]) {
        const vars = Object.entries(combinedCSSVariables[mode])
            .map(([prop, value]) => `${prop}:${value} !important`)
            .join(';');
        themeSheetCache[mode] = `:root{color-scheme:${mode} !important;${vars}}`;
    }
    return themeSheetCache[mode];
}

const FONTS_LINK_ID = 'falcon-fonts-link';
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Geist:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

const myConfig: PrototypeConfig = {
    prototypeId: 'project-falcon',
    title: 'Falcon settings',
    controls: [
        {
            id: 'brandColorHex',
            type: 'text',
            label: 'Brand colour',
            description: 'Hex colour for the Falcon wordmark / container.',
            defaultValue: '#18181b',
            placeholder: '#18181b',
        },
        {
            id: 'logoStyle',
            type: 'dropdown',
            label: 'Logo style',
            description: 'Text-only wordmark, or wrap "Falcon" in a coloured container.',
            defaultValue: 'container',
            options: [
                { value: 'container', label: 'Container' },
                { value: 'text', label: 'Text' },
            ],
        },
        {
            id: 'browseLayout',
            type: 'dropdown',
            label: 'Browse layout',
            description: 'Separate Fleet/Deployments pages, or one unified page with a Workspaces ↔ Deployments toggle.',
            defaultValue: 'separate',
            options: [
                { value: 'separate', label: 'Separate pages' },
                { value: 'unified',  label: 'Unified with toggle' },
            ],
        },
    ],
};

const ProjectFalcon: React.FC = () => {
    // Live Tweakpane toggle (open the panel via ⌘K). Drives both the injected
    // host-level theme stylesheet and the SHAD_VARS applied to the prototype
    // root, keeping the two in sync.
    const { params } = useTweakpane(
        { darkMode: false },
        { darkMode: { label: 'Dark mode' } },
    );
    const darkMode = params.darkMode as boolean;
    const mode: 'light' | 'dark' = darkMode ? 'dark' : 'light';

    // Force the chosen theme on the host (the host theme may be the opposite).
    // Re-runs when the toggle flips so the stylesheet swaps in place.
    useLayoutEffect(() => {
        const existing = document.getElementById(FORCE_THEME_STYLE_ID);
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = FORCE_THEME_STYLE_ID;
        style.textContent = getThemeStyleSheet(mode);
        document.head.appendChild(style);
        return () => { style.remove(); };
    }, [mode]);

    // Lazy-load Inter, Geist, and JetBrains Mono so the shadcn vocabulary
    // reads correctly even outside the host's font stack.
    useEffect(() => {
        if (document.getElementById(FONTS_LINK_ID)) return;
        const link = document.createElement('link');
        link.id = FONTS_LINK_ID;
        link.rel = 'stylesheet';
        link.href = FONTS_HREF;
        document.head.appendChild(link);
    }, []);

    const { getValue } = usePrototypeConfig(myConfig);
    const brandColor = getValue<string>('brandColorHex', '#18181b') || '#18181b';
    const logoStyle = (getValue<string>('logoStyle', 'container') || 'container') as 'container' | 'text';
    const unified = (getValue<string>('browseLayout', 'separate') || 'separate') === 'unified';

    const [section, setSection] = useState<FalconSection>('fleet');
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    // Unified mode collapses Fleet + Deployments into a single Fleet entry.
    const navItems = useMemo<NavItem[]>(() => unified
        ? [{ id: 'fleet', label: 'Fleet' }, { id: 'customers', label: 'Customers' }]
        : [
            { id: 'fleet',       label: 'Fleet'       },
            { id: 'deployments', label: 'Deployments' },
            { id: 'customers',   label: 'Customers'   },
          ],
    [unified]);

    // If we switched to unified while a deployments page was open, jump to fleet.
    useEffect(() => {
        if (unified && section === 'deployments') setSection('fleet');
    }, [unified, section]);

    const handleNavigate = (next: FalconSection) => {
        setSection(next);
        setSelectedWorkspaceId(null);
        setSelectedCustomerId(null);
    };

    const handleSelectWorkspace = (id: string) => setSelectedWorkspaceId(id);
    const handleSelectCustomer = (id: string) => setSelectedCustomerId(id);

    // Jump straight to a customer's detail page (e.g. from a workspace's
    // breadcrumb / header). Clears the workspace drill-down and switches the
    // active section so the customer detail isn't intercepted.
    const handleNavigateToCustomer = (id: string) => {
        setSelectedWorkspaceId(null);
        setSection('customers');
        setSelectedCustomerId(id);
    };

    const handleBackFromWorkspace = () => setSelectedWorkspaceId(null);
    const handleBackFromCustomer = () => setSelectedCustomerId(null);

    const renderBody = () => {
        if (selectedWorkspaceId) {
            return (
                <WorkspaceDetail
                    workspaceId={selectedWorkspaceId}
                    onBack={handleBackFromWorkspace}
                    onSelectCustomer={handleNavigateToCustomer}
                />
            );
        }
        switch (section) {
            case 'fleet':
                return unified
                    ? <FIBrowse mode0="workspaces" showToggle onSelectWorkspace={handleSelectWorkspace} />
                    : <FleetOverview onSelectWorkspace={handleSelectWorkspace} />;
            case 'deployments':
                return <DeploymentSearch onSelectWorkspace={handleSelectWorkspace} />;
            case 'customers':
                if (selectedCustomerId) {
                    return (
                        <CustomerDetail
                            customerId={selectedCustomerId}
                            onBack={handleBackFromCustomer}
                            onSelectWorkspace={handleSelectWorkspace}
                            onSelectCustomer={handleSelectCustomer}
                        />
                    );
                }
                return <CustomerCatalog onSelectCustomer={handleSelectCustomer} />;
        }
    };

    useEffect(() => {
        const base = 'Project Falcon';
        let suffix = 'Fleet';
        if (selectedWorkspaceId) suffix = `Workspace · ${selectedWorkspaceId}`;
        else if (section === 'deployments') suffix = 'Deployments';
        else if (section === 'customers') suffix = selectedCustomerId ? `Customer · ${selectedCustomerId}` : 'Customers';
        const prev = document.title;
        document.title = `${suffix} — ${base}`;
        return () => { document.title = prev; };
    }, [section, selectedWorkspaceId, selectedCustomerId]);

    return (
        <div
            className="h-screen flex bg-background text-foreground"
            style={darkMode ? SHAD_VARS_DARK : SHAD_VARS_LIGHT}
        >
            <NavShell
                section={section}
                items={navItems}
                onNavigate={handleNavigate}
                brandColor={brandColor}
                logoStyle={logoStyle}
            >
                {renderBody()}
            </NavShell>
        </div>
    );
};

export const title = 'Project Falcon';
export const route = '/project-falcon';

export default ProjectFalcon;
