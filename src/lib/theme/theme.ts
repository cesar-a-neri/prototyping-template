import * as radixColors from '@radix-ui/colors';

export { radixColors };

// Definitive list of all Radix color names (single source of truth)
export const RADIX_COLOR_NAMES = [
    // Grayscale
    'gray', 'mauve', 'slate', 'sage', 'olive', 'sand',
    // Cool colors
    'blue', 'cyan', 'teal', 'jade', 'green', 'grass',
    'lime', 'mint', 'sky', 'indigo', 'iris', 'violet', 'purple',
    // Warm colors
    'red', 'pink', 'tomato', 'ruby', 'crimson', 'plum',
    'orange', 'amber', 'yellow', 'bronze', 'gold', 'brown',
] as const;

// Generate TypeScript types from the definitive list
export type RadixColorName = typeof RADIX_COLOR_NAMES[number];
export type RadixColorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Alpha color names (all Radix colors have alpha variants)
export type AlphaColorName = RadixColorName;

// Template literal type for CSS variable names
export type RadixCSSVariable<T extends string, S extends number> = `var(--${T}-${S})`;

// Semantic theme tokens mapped to Radix colors using the 12-step system
export const themeTokens = {
    light: {
        // Base colors using gray scale
        background: radixColors.gray.gray2,        // Lightest background
        foreground: radixColors.gray.gray12,       // Highest contrast text
        muted: radixColors.gray.gray3,             // Muted background
        'muted-foreground': radixColors.gray.gray11, // Muted text

        // Card colors
        card: radixColors.gray.gray1,              // Card background
        'card-foreground': radixColors.gray.gray12, // Card text

        // Popover colors
        popover: radixColors.gray.gray1,           // Popover background
        'popover-foreground': radixColors.gray.gray12, // Popover text

        // Interactive elements
        border: radixColors.gray.gray6,            // Default border
        input: radixColors.gray.gray8,             // Input border
        ring: radixColors.iris.iris9,              // Focus ring

        // Primary colors using iris
        primary: radixColors.iris.iris9,           // Primary button
        'primary-foreground': radixColors.gray.gray1, // Primary button text
        'primary-border': radixColors.iris.iris8,  // Primary button border
        'primary-hover': radixColors.iris.iris10,  // Primary button hover
        'primary-text': radixColors.iris.iris11,   // Primary text color

        // Secondary colors
        secondary: radixColors.gray.gray2,         // Secondary button
        'secondary-foreground': radixColors.gray.gray12, // Secondary button text
        'secondary-border': radixColors.gray.gray7, // Secondary button border
        'secondary-hover': radixColors.gray.gray3,  // Secondary button hover

        // Hover state
        hover: radixColors.gray.gray4,             // General hover background
        'hover-foreground': radixColors.gray.gray12, // Hover text

        // Error colors using red
        error: radixColors.red.red3,
        'error-foreground': radixColors.red.red11,
        'error-border': radixColors.red.red7,
        'error-hover': radixColors.red.red4,
        'error-text': radixColors.red.red9,

        // Success colors using green
        success: radixColors.green.green3,
        'success-foreground': radixColors.green.green11,
        'success-border': radixColors.green.green7,
        'success-hover': radixColors.green.green4,
        'success-text': radixColors.green.green9,

        // Warning colors using amber
        warning: radixColors.amber.amber3,
        'warning-foreground': radixColors.amber.amber11,
        'warning-border': radixColors.amber.amber7,
        'warning-hover': radixColors.amber.amber4,
        'warning-text': radixColors.amber.amber9,

        // Info colors using cyan
        info: radixColors.cyan.cyan3,
        'info-foreground': radixColors.cyan.cyan11,
        'info-border': radixColors.cyan.cyan7,
        'info-hover': radixColors.cyan.cyan4,
        'info-text': radixColors.cyan.cyan9,
    },
    dark: {
        // Base colors using gray scale (dark)
        background: radixColors.grayDark.gray1,    // Darkest background
        foreground: radixColors.grayDark.gray12,   // Highest contrast text
        muted: radixColors.grayDark.gray2,         // Muted background
        'muted-foreground': radixColors.grayDark.gray11, // Muted text

        // Card colors
        card: radixColors.grayDark.gray3,          // Card background
        'card-foreground': radixColors.grayDark.gray12, // Card text

        // Popover colors
        popover: radixColors.grayDark.gray3,       // Popover background
        'popover-foreground': radixColors.grayDark.gray12, // Popover text

        // Interactive elements
        border: radixColors.grayDark.gray6,        // Default border
        input: radixColors.grayDark.gray8,         // Input border
        ring: radixColors.irisDark.iris9,          // Focus ring

        // Primary colors using iris dark
        primary: radixColors.irisDark.iris9,       // Primary button
        'primary-foreground': radixColors.grayDark.gray12, // Primary button text
        'primary-border': radixColors.irisDark.iris7, // Primary button border
        'primary-hover': radixColors.irisDark.iris10, // Primary button hover
        'primary-text': radixColors.irisDark.iris11, // Primary text color

        // Secondary colors
        secondary: 'rgba(0, 0, 0, 0)',             // Transparent secondary
        'secondary-foreground': radixColors.grayDark.gray12, // Secondary button text
        'secondary-border': radixColors.grayDark.gray7, // Secondary button border
        'secondary-hover': radixColors.grayDark.gray3,  // Secondary button hover

        // Hover state
        hover: radixColors.grayDark.gray4,         // General hover background
        'hover-foreground': radixColors.grayDark.gray12, // Hover text

        // Error colors using red dark
        error: radixColors.redDark.red3,
        'error-foreground': radixColors.redDark.red11,
        'error-border': radixColors.redDark.red7,
        'error-hover': radixColors.redDark.red4,
        'error-text': radixColors.redDark.red9,

        // Success colors using green dark
        success: radixColors.greenDark.green3,
        'success-foreground': radixColors.greenDark.green11,
        'success-border': radixColors.greenDark.green7,
        'success-hover': radixColors.greenDark.green4,
        'success-text': radixColors.greenDark.green9,

        // Warning colors using amber dark
        warning: radixColors.amberDark.amber3,
        'warning-foreground': radixColors.amberDark.amber11,
        'warning-border': radixColors.amberDark.amber7,
        'warning-hover': radixColors.amberDark.amber4,
        'warning-text': radixColors.amberDark.amber9,

        // Info colors using cyan dark
        info: radixColors.cyanDark.cyan3,
        'info-foreground': radixColors.cyanDark.cyan11,
        'info-border': radixColors.cyanDark.cyan7,
        'info-hover': radixColors.cyanDark.cyan4,
        'info-text': radixColors.cyanDark.cyan9,
    },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeToken = keyof typeof themeTokens.light;

export interface Theme {
    mode: ThemeMode;
    colors: typeof themeTokens[ThemeMode];
}

export const createTheme = (mode: ThemeMode): Theme => ({
    mode,
    colors: themeTokens[mode],
});

// Helper function to automatically generate CSS variables from theme tokens
const generateCSSVariables = (tokens: typeof themeTokens.light) => {
    const variables: Record<string, string> = {};

    // Handle all theme tokens consistently
    Object.entries(tokens).forEach(([key, value]) => {
        if (typeof value === 'string') {
            variables[`--${key}`] = value;
        }
    });

    return variables;
};

// Auto-generated CSS Custom Properties mapping for semantic tokens
export const cssVariables = {
    light: generateCSSVariables(themeTokens.light),
    dark: generateCSSVariables(themeTokens.dark),
} as const;

// Helper to generate CSS variables for a color scale
const generateColorScaleVariables = (scaleName: string, scale: any) => {
    const variables: Record<string, string> = {};
    for (let i = 1; i <= 12; i++) {
        variables[`--${scaleName}-${i}`] = scale[`${scaleName}${i}`];
    }
    return variables;
};

// Helper to generate alpha scale variables
const generateAlphaScaleVariables = (scaleName: string, scale: any) => {
    const variables: Record<string, string> = {};
    for (let i = 1; i <= 12; i++) {
        variables[`--${scaleName}-a${i}`] = scale[`${scaleName}A${i}`];
    }
    return variables;
};

// Helper to generate all radix CSS variables automatically
const generateAllRadixCSSVariables = () => {
    const colorNames = Object.keys(radixColors).filter(name =>
        !name.endsWith('Dark') && !name.endsWith('A')
    );

    const alphaColorNames = Object.keys(radixColors).filter(name =>
        name.endsWith('A') && !name.startsWith('black') && !name.startsWith('white')
    );

    const light: Record<string, string> = {};
    const dark: Record<string, string> = {};

    // Generate regular color scales
    for (const colorName of colorNames) {
        const lightScale = radixColors[colorName as keyof typeof radixColors];
        const darkScale = radixColors[`${colorName}Dark` as keyof typeof radixColors];

        if (lightScale && darkScale) {
            Object.assign(light, generateColorScaleVariables(colorName, lightScale));
            Object.assign(dark, generateColorScaleVariables(colorName, darkScale));
        }
    }

    // Generate alpha color scales
    for (const alphaName of alphaColorNames) {
        const baseColorName = alphaName.replace('A', '');
        const alphaScale = radixColors[alphaName as keyof typeof radixColors];

        if (alphaScale) {
            const alphaVars = generateAlphaScaleVariables(baseColorName, alphaScale);
            Object.assign(light, alphaVars);
            Object.assign(dark, alphaVars); // Alpha colors are the same for both themes
        }
    }

    // Add black and white alpha scales manually since they don't follow the pattern
    Object.assign(light, generateAlphaScaleVariables('black', radixColors.blackA));
    Object.assign(light, generateAlphaScaleVariables('white', radixColors.whiteA));
    Object.assign(dark, generateAlphaScaleVariables('black', radixColors.blackA));
    Object.assign(dark, generateAlphaScaleVariables('white', radixColors.whiteA));

    return { light, dark };
};

// Comprehensive Radix CSS Variables including all color palettes
export const radixCSSVariables = generateAllRadixCSSVariables();

// Combined CSS Variables (semantic theme + all radix colors)
export const combinedCSSVariables = {
    light: {
        ...cssVariables.light,
        ...radixCSSVariables.light,
    },
    dark: {
        ...cssVariables.dark,
        ...radixCSSVariables.dark,
    },
} as const;

