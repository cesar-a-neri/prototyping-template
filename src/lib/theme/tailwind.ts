import { RADIX_COLOR_NAMES } from './theme';

// Utility function to generate Tailwind color configuration from the definitive list
export const generateTailwindColors = () => {
    const colors: Record<string, Record<string, string>> = {};

    // Generate color scales (1-12) for each Radix color
    for (const colorName of RADIX_COLOR_NAMES) {
        colors[colorName] = {};
        for (let step = 1; step <= 12; step++) {
            colors[colorName][step] = `var(--${colorName}-${step})`;
        }
    }

    // Add alpha colors for black and white
    colors['black-a'] = {};
    colors['white-a'] = {};
    for (let step = 1; step <= 12; step++) {
        colors['black-a'][step] = `var(--black-a${step})`;
        colors['white-a'][step] = `var(--white-a${step})`;
    }

    return colors;
};
