import { ComponentType } from 'react';

// Use Vite's import.meta.glob to get all prototype files
export const prototypeModules = import.meta.glob('../pages/prototypes/**/*.tsx', { eager: true }) as Record<string, {
  default: ComponentType,
  route?: string,
  title?: string
}>;

// Import source code as raw strings (including all files in subdirectories)
export const prototypeSourceModules = import.meta.glob('../pages/prototypes/**/*', {
  query: '?raw',
  eager: true,
  import: 'default'
}) as Record<string, string>;

export const getPrototypeRoutes = async () => {
  const routes: Array<{
    path: string;
    title: string;
    module: () => Promise<{ default: ComponentType }>;
    sourceFiles: Array<{ path: string; content: string }>;
  }> = [];

  for (const [path, module] of Object.entries(prototypeModules)) {
    // Skip modules without a defined route
    if (!module.route) continue;

    const fileName = path.split('/').pop()?.replace('.tsx', '') || '';

    // Use defined title if available, otherwise generate from filename
    const title = module.title || fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Create a wrapper function to return the module in the expected format
    const moduleWrapper = () => {
      return Promise.resolve({ default: module.default });
    };

    // Get the directory path for this prototype
    const prototypeDir = path.substring(0, path.lastIndexOf('/'));

    // Find all source files for this prototype
    const sourceFiles = Object.entries(prototypeSourceModules)
      .filter(([sourcePath]) => sourcePath.startsWith(prototypeDir))
      .map(([sourcePath, content]) => ({
        path: sourcePath.replace('../pages/', 'src/pages/'),
        content: content
      }))
      .sort((a, b) => {
        // Sort index files first, then alphabetically
        if (a.path.includes('index.tsx')) return -1;
        if (b.path.includes('index.tsx')) return 1;
        return a.path.localeCompare(b.path);
      });

    routes.push({
      path: module.route,
      title,
      module: moduleWrapper,
      sourceFiles
    });
  }

  return routes;
};