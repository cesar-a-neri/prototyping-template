// ─── Types ────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  type: 'user' | 'service-account';
};

export type GroupMember = User & {
  role: 'owner' | 'member';
  addedAt: string;
};

export type AccessBinding = {
  id: string;
  resourceType: string;
  resourceName: string;
  projectName: string;
  role: RoleName;
  grantedAt: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  accessBindings: AccessBinding[];
  createdAt: string;
};

export type RoleName = 'Owner' | 'Editor' | 'Operator' | 'Viewer';

export type Permission = {
  id: string;
  label: string;
  description: string;
};

export type ResourcePermissionMap = {
  resourceType: string;
  permissions: string[];
};

export type RoleDefinition = {
  name: RoleName;
  description: string;
  summary: string;
  color: string;
  resourcePermissions: ResourcePermissionMap[];
};

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice.chen@acme.com', initials: 'AC', type: 'user' },
  { id: 'u2', name: 'Bob Martinez', email: 'bob.martinez@acme.com', initials: 'BM', type: 'user' },
  { id: 'u3', name: 'Carol Singh', email: 'carol.singh@acme.com', initials: 'CS', type: 'user' },
  { id: 'u4', name: 'David Kim', email: 'david.kim@acme.com', initials: 'DK', type: 'user' },
  { id: 'u5', name: 'Eve Thompson', email: 'eve.thompson@acme.com', initials: 'ET', type: 'user' },
  { id: 'u6', name: 'Frank Liu', email: 'frank.liu@acme.com', initials: 'FL', type: 'user' },
  { id: 'u7', name: 'Grace Okafor', email: 'grace.okafor@acme.com', initials: 'GO', type: 'user' },
  { id: 'u8', name: 'Henry Patel', email: 'henry.patel@acme.com', initials: 'HP', type: 'user' },
  { id: 'sa1', name: 'ci-pipeline-bot', email: 'ci-pipeline@svc.acme.com', initials: 'CI', type: 'service-account' },
  { id: 'sa2', name: 'deploy-agent', email: 'deploy-agent@svc.acme.com', initials: 'DA', type: 'service-account' },
  { id: 'sa3', name: 'monitoring-svc', email: 'monitoring@svc.acme.com', initials: 'MS', type: 'service-account' },
];

// ─── Mock Groups ──────────────────────────────────────────────────────────────

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Platform Engineering',
    description: 'Core platform team responsible for infrastructure and shared services',
    members: [
      { ...MOCK_USERS[0], role: 'owner', addedAt: '2025-01-15' },
      { ...MOCK_USERS[1], role: 'owner', addedAt: '2025-01-15' },
      { ...MOCK_USERS[2], role: 'member', addedAt: '2025-02-01' },
      { ...MOCK_USERS[3], role: 'member', addedAt: '2025-03-10' },
      { ...MOCK_USERS[8], role: 'member', addedAt: '2025-02-20' },
    ],
    accessBindings: [
      { id: 'ab1', resourceType: 'Agent', resourceName: 'Customer Support Bot', projectName: 'Production', role: 'Owner', grantedAt: '2025-01-20' },
      { id: 'ab2', resourceType: 'Knowledge Base', resourceName: 'Product Documentation', projectName: 'Production', role: 'Editor', grantedAt: '2025-01-20' },
      { id: 'ab3', resourceType: 'Model', resourceName: 'GPT-4o Fine-tuned', projectName: 'Production', role: 'Operator', grantedAt: '2025-02-15' },
      { id: 'ab4', resourceType: 'Connector', resourceName: 'Salesforce Integration', projectName: 'Staging', role: 'Viewer', grantedAt: '2025-03-01' },
    ],
    createdAt: '2025-01-15',
  },
  {
    id: 'g2',
    name: 'Data Science Team',
    description: 'ML researchers and data scientists working on model development',
    members: [
      { ...MOCK_USERS[4], role: 'owner', addedAt: '2025-01-20' },
      { ...MOCK_USERS[5], role: 'member', addedAt: '2025-02-01' },
      { ...MOCK_USERS[6], role: 'member', addedAt: '2025-02-15' },
      { ...MOCK_USERS[9], role: 'member', addedAt: '2025-03-01' },
    ],
    accessBindings: [
      { id: 'ab5', resourceType: 'Model', resourceName: 'GPT-4o Fine-tuned', projectName: 'Research', role: 'Editor', grantedAt: '2025-02-01' },
      { id: 'ab6', resourceType: 'Knowledge Base', resourceName: 'Training Datasets', projectName: 'Research', role: 'Owner', grantedAt: '2025-02-01' },
      { id: 'ab7', resourceType: 'Evaluation', resourceName: 'Model Accuracy Suite', projectName: 'Research', role: 'Editor', grantedAt: '2025-02-20' },
    ],
    createdAt: '2025-01-20',
  },
  {
    id: 'g3',
    name: 'ML Operations',
    description: 'Deployment, monitoring, and reliability of ML systems',
    members: [
      { ...MOCK_USERS[1], role: 'owner', addedAt: '2025-02-01' },
      { ...MOCK_USERS[7], role: 'member', addedAt: '2025-02-15' },
      { ...MOCK_USERS[8], role: 'member', addedAt: '2025-02-15' },
      { ...MOCK_USERS[10], role: 'member', addedAt: '2025-03-01' },
    ],
    accessBindings: [
      { id: 'ab8', resourceType: 'Agent', resourceName: 'Customer Support Bot', projectName: 'Production', role: 'Operator', grantedAt: '2025-02-10' },
      { id: 'ab9', resourceType: 'Agent', resourceName: 'Internal Q&A Agent', projectName: 'Production', role: 'Operator', grantedAt: '2025-02-10' },
      { id: 'ab10', resourceType: 'Dashboard', resourceName: 'Ops Monitoring', projectName: 'Production', role: 'Editor', grantedAt: '2025-02-15' },
    ],
    createdAt: '2025-02-01',
  },
  {
    id: 'g4',
    name: 'Security & Compliance',
    description: 'Security auditing and compliance oversight',
    members: [
      { ...MOCK_USERS[3], role: 'owner', addedAt: '2025-02-10' },
      { ...MOCK_USERS[0], role: 'member', addedAt: '2025-02-15' },
    ],
    accessBindings: [
      { id: 'ab11', resourceType: 'Agent', resourceName: 'Customer Support Bot', projectName: 'Production', role: 'Viewer', grantedAt: '2025-02-20' },
      { id: 'ab12', resourceType: 'Connector', resourceName: 'Salesforce Integration', projectName: 'Production', role: 'Viewer', grantedAt: '2025-02-20' },
    ],
    createdAt: '2025-02-10',
  },
  {
    id: 'g5',
    name: 'Product Team',
    description: 'Product managers and designers shaping the roadmap',
    members: [
      { ...MOCK_USERS[6], role: 'owner', addedAt: '2025-03-01' },
      { ...MOCK_USERS[7], role: 'member', addedAt: '2025-03-05' },
    ],
    accessBindings: [
      { id: 'ab13', resourceType: 'Dashboard', resourceName: 'Product Analytics', projectName: 'Production', role: 'Viewer', grantedAt: '2025-03-05' },
    ],
    createdAt: '2025-03-01',
  },
];

// ─── Permission Definitions ───────────────────────────────────────────────────

export const ALL_PERMISSIONS: Permission[] = [
  { id: 'view', label: 'View', description: 'View resource details and configuration' },
  { id: 'edit', label: 'Edit', description: 'Modify resource configuration and content' },
  { id: 'delete', label: 'Delete', description: 'Permanently delete the resource' },
  { id: 'invoke', label: 'Invoke', description: 'Send requests to and interact with the resource' },
  { id: 'deploy', label: 'Deploy', description: 'Deploy resource to production environments' },
  { id: 'query', label: 'Query', description: 'Run queries against the resource' },
  { id: 'train', label: 'Train', description: 'Initiate and manage training jobs' },
  { id: 'evaluate', label: 'Evaluate', description: 'Run evaluations and view results' },
  { id: 'connect', label: 'Connect', description: 'Establish and manage connections' },
  { id: 'manage-access', label: 'Manage Access', description: 'Grant or revoke access for other principals' },
];

// ─── Role Definitions ─────────────────────────────────────────────────────────

export const RESOURCE_TYPES = ['Agent', 'Knowledge Base', 'Model', 'Connector', 'Evaluation', 'Dashboard', 'Workflow', 'Tool'] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: 'Owner',
    description: 'Full control over the resource, including the ability to manage who else can access it.',
    summary: 'Full access + manage permissions',
    color: '#E54D2E',
    resourcePermissions: [
      { resourceType: 'Agent', permissions: ['view', 'edit', 'delete', 'invoke', 'deploy', 'manage-access'] },
      { resourceType: 'Knowledge Base', permissions: ['view', 'edit', 'delete', 'query', 'manage-access'] },
      { resourceType: 'Model', permissions: ['view', 'edit', 'delete', 'train', 'deploy', 'manage-access'] },
      { resourceType: 'Connector', permissions: ['view', 'edit', 'delete', 'connect', 'manage-access'] },
      { resourceType: 'Evaluation', permissions: ['view', 'edit', 'delete', 'evaluate', 'manage-access'] },
      { resourceType: 'Dashboard', permissions: ['view', 'edit', 'delete', 'manage-access'] },
      { resourceType: 'Workflow', permissions: ['view', 'edit', 'delete', 'invoke', 'deploy', 'manage-access'] },
      { resourceType: 'Tool', permissions: ['view', 'edit', 'delete', 'invoke', 'manage-access'] },
    ],
  },
  {
    name: 'Editor',
    description: 'Can create and modify the resource, but cannot manage access or delete it.',
    summary: 'Create & modify resources',
    color: '#E5A000',
    resourcePermissions: [
      { resourceType: 'Agent', permissions: ['view', 'edit', 'invoke', 'deploy'] },
      { resourceType: 'Knowledge Base', permissions: ['view', 'edit', 'query'] },
      { resourceType: 'Model', permissions: ['view', 'edit', 'train', 'deploy'] },
      { resourceType: 'Connector', permissions: ['view', 'edit', 'connect'] },
      { resourceType: 'Evaluation', permissions: ['view', 'edit', 'evaluate'] },
      { resourceType: 'Dashboard', permissions: ['view', 'edit'] },
      { resourceType: 'Workflow', permissions: ['view', 'edit', 'invoke', 'deploy'] },
      { resourceType: 'Tool', permissions: ['view', 'edit', 'invoke'] },
    ],
  },
  {
    name: 'Operator',
    description: 'Can execute and deploy the resource, but cannot modify its configuration.',
    summary: 'Execute & deploy resources',
    color: '#5B5CE6',
    resourcePermissions: [
      { resourceType: 'Agent', permissions: ['view', 'invoke', 'deploy'] },
      { resourceType: 'Knowledge Base', permissions: ['view', 'query'] },
      { resourceType: 'Model', permissions: ['view', 'deploy'] },
      { resourceType: 'Connector', permissions: ['view', 'connect'] },
      { resourceType: 'Evaluation', permissions: ['view', 'evaluate'] },
      { resourceType: 'Dashboard', permissions: ['view'] },
      { resourceType: 'Workflow', permissions: ['view', 'invoke', 'deploy'] },
      { resourceType: 'Tool', permissions: ['view', 'invoke'] },
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to the resource. Cannot make any changes.',
    summary: 'Read-only access',
    color: '#889096',
    resourcePermissions: [
      { resourceType: 'Agent', permissions: ['view'] },
      { resourceType: 'Knowledge Base', permissions: ['view'] },
      { resourceType: 'Model', permissions: ['view'] },
      { resourceType: 'Connector', permissions: ['view'] },
      { resourceType: 'Evaluation', permissions: ['view'] },
      { resourceType: 'Dashboard', permissions: ['view'] },
      { resourceType: 'Workflow', permissions: ['view'] },
      { resourceType: 'Tool', permissions: ['view'] },
    ],
  },
];

export function getPermissionsForRole(roleName: RoleName, resourceType: string): string[] {
  const role = ROLE_DEFINITIONS.find(r => r.name === roleName);
  if (!role) return [];
  const rp = role.resourcePermissions.find(rp => rp.resourceType === resourceType);
  return rp?.permissions ?? [];
}

// ─── Tenant Users (public directory) ──────────────────────────────────────────

export type TenantUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  type: 'user' | 'service-account';
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  groups: string[];
  createdAt: string;
};

export const TENANT_USERS: TenantUser[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice.chen@acme.com', initials: 'AC', type: 'user', status: 'active', lastActive: '2026-04-16', groups: ['Platform Engineering', 'Security & Compliance'], createdAt: '2024-11-02' },
  { id: 'u2', name: 'Bob Martinez', email: 'bob.martinez@acme.com', initials: 'BM', type: 'user', status: 'active', lastActive: '2026-04-16', groups: ['Platform Engineering', 'ML Operations', 'Data Science Team', 'Security & Compliance', 'Product Team'], createdAt: '2024-11-05' },
  { id: 'u3', name: 'Carol Singh', email: 'carol.singh@acme.com', initials: 'CS', type: 'user', status: 'active', lastActive: '2026-04-15', groups: ['Platform Engineering'], createdAt: '2024-12-01' },
  { id: 'u4', name: 'David Kim', email: 'david.kim@acme.com', initials: 'DK', type: 'user', status: 'active', lastActive: '2026-04-14', groups: ['Platform Engineering', 'Security & Compliance'], createdAt: '2024-12-10' },
  { id: 'u5', name: 'Eve Thompson', email: 'eve.thompson@acme.com', initials: 'ET', type: 'user', status: 'active', lastActive: '2026-04-16', groups: ['Data Science Team'], createdAt: '2025-01-08' },
  { id: 'u6', name: 'Frank Liu', email: 'frank.liu@acme.com', initials: 'FL', type: 'user', status: 'active', lastActive: '2026-04-13', groups: ['Data Science Team'], createdAt: '2025-01-15' },
  { id: 'u7', name: 'Grace Okafor', email: 'grace.okafor@acme.com', initials: 'GO', type: 'user', status: 'active', lastActive: '2026-04-16', groups: ['Data Science Team', 'Product Team'], createdAt: '2025-01-20' },
  { id: 'u8', name: 'Henry Patel', email: 'henry.patel@acme.com', initials: 'HP', type: 'user', status: 'inactive', lastActive: '2026-03-01', groups: ['ML Operations', 'Product Team'], createdAt: '2025-02-01' },
  { id: 'u9', name: 'Irene Nakamura', email: 'irene.nakamura@acme.com', initials: 'IN', type: 'user', status: 'active', lastActive: '2026-04-15', groups: [], createdAt: '2025-03-10' },
  { id: 'u10', name: 'James Wilson', email: 'james.wilson@acme.com', initials: 'JW', type: 'user', status: 'pending', lastActive: 'Never', groups: [], createdAt: '2026-04-14' },
  { id: 'u11', name: 'Karen Lee', email: 'karen.lee@acme.com', initials: 'KL', type: 'user', status: 'active', lastActive: '2026-04-12', groups: [], createdAt: '2025-04-01' },
  { id: 'sa1', name: 'ci-pipeline-bot', email: 'ci-pipeline@svc.acme.com', initials: 'CI', type: 'service-account', status: 'active', lastActive: '2026-04-16', groups: ['Platform Engineering'], createdAt: '2025-01-15' },
  { id: 'sa2', name: 'deploy-agent', email: 'deploy-agent@svc.acme.com', initials: 'DA', type: 'service-account', status: 'active', lastActive: '2026-04-16', groups: ['Data Science Team'], createdAt: '2025-02-01' },
  { id: 'sa3', name: 'monitoring-svc', email: 'monitoring@svc.acme.com', initials: 'MS', type: 'service-account', status: 'active', lastActive: '2026-04-15', groups: ['ML Operations'], createdAt: '2025-02-15' },
];

export function getPermissionLabel(permId: string): string {
  return ALL_PERMISSIONS.find(p => p.id === permId)?.label ?? permId;
}

export function getPermissionDescription(permId: string): string {
  return ALL_PERMISSIONS.find(p => p.id === permId)?.description ?? '';
}
