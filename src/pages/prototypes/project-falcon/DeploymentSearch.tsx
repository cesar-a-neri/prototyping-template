// Deployment Search — thin wrapper around the shared FIBrowse layout in
// deployments mode.

import React from 'react';
import { FIBrowse } from './FIBrowse';

export const DeploymentSearch: React.FC<{ onSelectWorkspace?: (id: string) => void }> = ({ onSelectWorkspace }) => (
    <FIBrowse mode0="deployments" onSelectWorkspace={onSelectWorkspace} />
);
