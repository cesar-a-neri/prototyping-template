// Fleet Health Overview — thin wrapper around the shared FIBrowse layout in
// workspaces mode.

import React from 'react';
import { FIBrowse } from './FIBrowse';

export const FleetOverview: React.FC<{ onSelectWorkspace?: (id: string) => void }> = ({ onSelectWorkspace }) => (
    <FIBrowse mode0="workspaces" onSelectWorkspace={onSelectWorkspace} />
);
