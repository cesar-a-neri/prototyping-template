// Engineering-handoff bundler for the Falcon prototype.
//
// Produces a self-contained .zip an engineer can read top-to-bottom to
// understand and re-implement the front end:
//   - every Falcon source file (components, mock data, types, design tokens)
//   - the shadcn/Radix UI primitives Falcon actually uses
//   - the `cn` helper those primitives depend on
//   - a generated README describing the stack, tokens, and npm deps
//
// Zero runtime deps — the .zip is built with a tiny store-method (no
// compression) writer so we don't pull in JSZip. Scoped entirely to Falcon.

import { prototypeSourceModules } from '@/utils/prototypes';

const ROOT = 'falcon-prototype-handoff';

// shadcn primitives Falcon imports (see `@/components/ui`). Listed explicitly
// so the bundle stays focused — unused primitives (select, radio-group,
// contextmenu) are left out.
const USED_UI = [
    'badge', 'button', 'card', 'checkbox', 'input', 'label',
    'segmented-control', 'skeleton', 'switch', 'table', 'tabs', 'tooltip',
] as const;

// Raw source for the shared files Falcon leans on. import.meta.glob patterns
// must be static literals — Vite resolves them at build time.
const uiSource = import.meta.glob('../../../components/ui/*.tsx', {
    query: '?raw', eager: true, import: 'default',
}) as Record<string, string>;
const utilsSource = import.meta.glob('../../../lib/utils.ts', {
    query: '?raw', eager: true, import: 'default',
}) as Record<string, string>;

interface BundleFile { path: string; content: string }

// Paste-ready Tailwind v4 token layer. Maps the utility classes the bundled
// files use (bg-card, text-muted-foreground, border-border, bg-hover,
// bg-gray-3, …) to CSS variables, then sets light/dark values. The shadcn
// "zinc" values come from Falcon's SHAD_VARS; --popover, --hover and the two
// Radix steps (--gray-3/5) are the gaps Falcon's self-contained palette omits.
const THEME_CSS = `/* Falcon design tokens — Tailwind CSS v4.
 *
 * Paste into globals.css AFTER \`@import "tailwindcss";\`.
 * Requires tw-animate-css for the tooltip/tabs enter-exit animations:
 *     npm i -D tw-animate-css
 *
 * NOTE: the Falcon-specific severity/pack/tier/hatch tokens (--sev-*, --pack-*,
 * --tier-*, --hatch-*) are NOT here — they live in shared.tsx (SHAD_VARS_LIGHT/
 * DARK) and are applied inline on the prototype root. Keep that, or lift them
 * into :root / .dark alongside the variables below. The zinc-* utilities
 * (bg-zinc-800, text-zinc-300, …) are Tailwind v4 built-ins — no config needed.
 */
@import "tw-animate-css";

/* Class-based dark mode (shadcn v4 convention). */
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-hover: var(--hover);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Radix-scale steps used by SegmentedControl / Switch. */
  --color-gray-3: var(--gray-3);
  --color-gray-5: var(--gray-5);

  /* Badge status variants — Falcon's screens don't use these, included so the
   * Badge component is complete in its new home. */
  --color-success: var(--success);
  --color-success-border: var(--success-border);
  --color-success-text: var(--success-text);
  --color-error: var(--error);
  --color-error-foreground: var(--error-foreground);
  --color-warning: var(--warning);
  --color-warning-text: var(--warning-text);
}

:root {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --popover: #ffffff;
  --popover-foreground: #09090b;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --hover: #f4f4f5;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #a1a1aa;
  --gray-3: #f4f4f5;
  --gray-5: #e4e4e7;
  --success: #f0fdf4;
  --success-border: #bbf7d0;
  --success-text: #15803d;
  --error: #fef2f2;
  --error-foreground: #b91c1c;
  --warning: #fffbeb;
  --warning-text: #b45309;
}

.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #18181b;
  --card-foreground: #fafafa;
  --popover: #18181b;
  --popover-foreground: #fafafa;
  --primary: #fafafa;
  --primary-foreground: #18181b;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --hover: #27272a;
  --border: #27272a;
  --input: #27272a;
  --ring: #d4d4d8;
  --gray-3: #27272a;
  --gray-5: #3f3f46;
  --success: #052e16;
  --success-border: #14532d;
  --success-text: #86efac;
  --error: #450a0a;
  --error-foreground: #fca5a5;
  --warning: #451a03;
  --warning-text: #fcd34d;
}
`;

function collectFiles(): BundleFile[] {
    const files: BundleFile[] = [];

    // Falcon's own files (skip this bundler — it's harness tooling, not UI).
    for (const [key, content] of Object.entries(prototypeSourceModules)) {
        if (!key.includes('/project-falcon/')) continue;
        if (key.endsWith('/downloadHandoff.ts')) continue;
        files.push({ path: key.replace('../pages/', 'src/pages/'), content });
    }

    // Used UI primitives.
    for (const [key, content] of Object.entries(uiSource)) {
        const name = key.split('/').pop()!.replace('.tsx', '');
        if (!(USED_UI as readonly string[]).includes(name)) continue;
        files.push({ path: `src/components/ui/${name}.tsx`, content });
    }

    // The cn() helper.
    for (const content of Object.values(utilsSource)) {
        files.push({ path: 'src/lib/utils.ts', content });
    }

    files.sort((a, b) => a.path.localeCompare(b.path));

    // Paste-ready Tailwind v4 token layer (referenced by the README porting guide).
    files.unshift({ path: 'falcon-theme.css', content: THEME_CSS });
    files.unshift({ path: 'README.md', content: buildReadme(files) });
    return files.map(f => ({ ...f, path: `${ROOT}/${f.path}` }));
}

function buildReadme(files: BundleFile[]): string {
    const tree = files
        .map(f => `- \`${f.path}\``)
        .join('\n');

    return `# Project Falcon — front-end handoff

Scale's fleet control plane for SGP deployments. This bundle contains the
complete front end of the Falcon prototype plus the shared UI primitives it
depends on, so it can be read and re-implemented without the rest of the
prototyping repo.

## Stack

- **React 19** + **TypeScript**
- **Tailwind CSS** for styling — note this repo uses the **Radix Colors
  12-point scale** (\`bg-gray-3\`, \`text-blue-11\`) rather than Tailwind's
  default increments.
- **Radix UI** primitives under the hood of every \`src/components/ui/*\` file
- **lucide-react** for icons (the Slack mark in \`shared.tsx\` is a hand-rolled
  inline SVG — Lucide has no brand logos)
- **recharts** for the "Errors over time" area chart in \`FIBrowse.tsx\`

## npm dependencies

\`\`\`bash
npm install react react-dom \\
  lucide-react recharts \\
  clsx tailwind-merge \\
  @radix-ui/react-checkbox @radix-ui/react-switch \\
  @radix-ui/react-tabs @radix-ui/react-tooltip
\`\`\`

## Path alias

Imports use the \`@/\` alias, which maps to \`src/\`. Configure it in your
bundler (Vite: \`resolve.alias\`) and \`tsconfig.json\` \`compilerOptions.paths\`:

\`\`\`json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
\`\`\`

## Design tokens

The shadcn "zinc" palette and all Falcon-specific semantic colours (health
severity, pack status, customer tiers, hatch fills) are defined as CSS custom
properties in **\`src/pages/prototypes/project-falcon/shared.tsx\`** —
\`SHAD_VARS_LIGHT\` and \`SHAD_VARS_DARK\`. They're applied inline on the
prototype root in \`index.tsx\`; children read them via \`var(--…)\` and the
semantic Tailwind classes (\`bg-card\`, \`text-muted-foreground\`, \`border-border\`).
This is the source of truth for the visual language.

**\`falcon-theme.css\`** (at the root of this bundle) is a paste-ready Tailwind
**v4** \`@theme\` layer + light/dark values for those semantic tokens — see the
porting guide below.

## Porting to Next.js (App Router) + Tailwind v4

The React/TSX components are standard and run fine under the App Router and
Tailwind v4. Three mechanical steps:

### 1. \`"use client"\`
App Router components are server components by default; everything here uses
hooks / event handlers / charts. Add \`"use client"\` to the top of each screen:

- \`CustomerCatalog.tsx\`, \`CustomerDetail.tsx\`, \`WorkspaceDetail.tsx\`,
  \`FIBrowse.tsx\`, \`FleetOverview.tsx\`, \`DeploymentSearch.tsx\`, \`NavShell.tsx\`
- Primitives: \`switch.tsx\` and \`tooltip.tsx\` already declare it — also add it to
  \`checkbox.tsx\`, \`tabs.tsx\`, and \`segmented-control.tsx\`. The purely
  presentational primitives (\`badge\`, \`button\`, \`card\`, \`input\`, \`label\`,
  \`skeleton\`, \`table\`) don't need it.
- \`data.ts\` / \`types.ts\` are not components — no directive.

### 2. Drop the Vite harness
\`index.tsx\` is Vite/React-Router prototyping scaffolding (forced-theme
\`<style>\` injection, Tweakpane, config panel, the download button) and uses
\`import.meta.glob\`, which is **Vite-only**. Don't port it — recreate it as an
App Router layout/route. The screens themselves contain no \`import.meta\` /
\`window\` / \`document\`. The Fleet / Deployments / Customers switching becomes
route segments (or stays client-side state — your call).

### 3. Tailwind v4 token layer
The repo defines its colours in JS (\`tailwind.config.js\`); v4 is CSS-first.
Append **\`falcon-theme.css\`** to your \`globals.css\` (after
\`@import "tailwindcss";\`). It declares, for v4:

- the semantic tokens (\`bg-card\`, \`text-muted-foreground\`, \`border-border\`,
  \`ring-ring\`, \`bg-popover\`, …);
- the two Radix scale steps used (\`bg-gray-3\`, \`bg-gray-5\`) — \`zinc-*\`
  utilities are v4 built-ins and need nothing;
- \`--popover\` / \`--hover\` — gaps Falcon's inline \`SHAD_VARS\` omits, which
  \`Tooltip\` and \`SegmentedControl\` rely on;
- light + \`.dark\` values.

Then \`npm i -D tw-animate-css\` (the v4 successor to \`tailwindcss-animate\`) so
the \`Tooltip\`/\`Tabs\` enter-exit animations (\`animate-in\`, \`fade-in-0\`,
\`zoom-in-95\`, \`slide-in-from-*\`) work. Radius (\`rounded-md/lg/xl\`) uses v4
defaults — no action needed.

## Where things live

- \`index.tsx\` — top-level view router (Fleet · Deployments · Customers) and
  two detail subpages. **Contains prototyping-harness wiring** (forced theme
  stylesheet, Tweakpane, config panel, this download button) that you can drop
  in a real implementation — the reusable UI is in the files below.
- \`NavShell.tsx\` — global top navigation.
- \`CustomerCatalog.tsx\` / \`CustomerDetail.tsx\` — customer list + detail.
- \`FIBrowse.tsx\` — faceted browse powering both Fleet Health Overview and
  Deployment Search (one layout, two data sources).
- \`WorkspaceDetail.tsx\` — workspace drill-down (metadata, packs, feature flags).
- \`FleetOverview.tsx\` / \`DeploymentSearch.tsx\` — thin wrappers over \`FIBrowse\`.
- \`shared.tsx\` — design tokens + semantic Badge wrappers + helpers.
- \`data.ts\` / \`types.ts\` — **mock data and types.** Replace \`data.ts\` with
  your real API layer; the components only read the shapes in \`types.ts\`.
- \`src/components/ui/*\` — the shadcn/Radix primitives.

## File manifest

${tree}
`;
}

// ── minimal store-method ZIP writer (no compression, no deps) ──────────────

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

function crc32(bytes: Uint8Array): number {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files: BundleFile[]): Uint8Array {
    const enc = new TextEncoder();
    const local: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;

    for (const f of files) {
        const name = enc.encode(f.path);
        const data = enc.encode(f.content);
        const crc = crc32(data);
        const size = data.length;

        const lh = new Uint8Array(30 + name.length);
        const lv = new DataView(lh.buffer);
        lv.setUint32(0, 0x04034b50, true); // local file header signature
        lv.setUint16(4, 20, true);         // version needed
        lv.setUint16(6, 0, true);          // flags
        lv.setUint16(8, 0, true);          // method: store
        lv.setUint16(10, 0, true);         // mod time
        lv.setUint16(12, 0x21, true);      // mod date: 1980-01-01
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);      // compressed size
        lv.setUint32(22, size, true);      // uncompressed size
        lv.setUint16(26, name.length, true);
        lv.setUint16(28, 0, true);         // extra length
        lh.set(name, 30);
        local.push(lh, data);

        const ch = new Uint8Array(46 + name.length);
        const cv = new DataView(ch.buffer);
        cv.setUint32(0, 0x02014b50, true); // central dir header signature
        cv.setUint16(4, 20, true);         // version made by
        cv.setUint16(6, 20, true);         // version needed
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0x21, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, name.length, true);
        cv.setUint16(30, 0, true);         // extra
        cv.setUint16(32, 0, true);         // comment
        cv.setUint16(34, 0, true);         // disk number start
        cv.setUint16(36, 0, true);         // internal attrs
        cv.setUint32(38, 0, true);         // external attrs
        cv.setUint32(42, offset, true);    // local header offset
        ch.set(name, 46);
        central.push(ch);

        offset += lh.length + data.length;
    }

    const centralSize = central.reduce((s, c) => s + c.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);     // end of central dir signature
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);        // central dir offset
    ev.setUint16(20, 0, true);

    const out = new Uint8Array(offset + centralSize + end.length);
    let p = 0;
    for (const c of local) { out.set(c, p); p += c.length; }
    for (const c of central) { out.set(c, p); p += c.length; }
    out.set(end, p);
    return out;
}

/** Build the Falcon handoff bundle and trigger a browser download. */
export function downloadFalconHandoff(): void {
    const zip = buildZip(collectFiles());
    const blob = new Blob([zip], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ROOT}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
