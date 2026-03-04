import { ComponentType } from 'react';

export type PrototypeRoute = {
  path: string;
  title: string;
  module: () => Promise<{ default: ComponentType }>;
  sourceFiles: Array<{ path: string; content: string }>;
};
