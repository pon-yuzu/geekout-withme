export interface ThemeColors {
  primary: string;
  primaryDark: string;
  gradientFrom: string;
  gradientTo: string;
}

export const THEME_PRESETS: Record<string, ThemeColors> = {
  orange: {
    primary: '#f97316',
    primaryDark: '#ea580c',
    gradientFrom: '#fff7ed',
    gradientTo: '#fed7aa',
  },
  blue: {
    primary: '#64b5f6',
    primaryDark: '#42a5f5',
    gradientFrom: '#e3f2fd',
    gradientTo: '#bbdefb',
  },
  green: {
    primary: '#81c784',
    primaryDark: '#66bb6a',
    gradientFrom: '#e8f5e9',
    gradientTo: '#c8e6c9',
  },
  purple: {
    primary: '#b39ddb',
    primaryDark: '#9575cd',
    gradientFrom: '#ede7f6',
    gradientTo: '#d1c4e9',
  },
  pink: {
    primary: '#e8a4b8',
    primaryDark: '#d4899d',
    gradientFrom: '#ffecd2',
    gradientTo: '#e8b4cb',
  },
  coral: {
    primary: '#ef9a9a',
    primaryDark: '#e57373',
    gradientFrom: '#fce4ec',
    gradientTo: '#f8bbd0',
  },
};

export function getTheme(color: string): ThemeColors {
  return THEME_PRESETS[color] ?? THEME_PRESETS.orange;
}

export function getThemeCSS(color: string): string {
  const theme = getTheme(color);
  return `
    --color-primary: ${theme.primary};
    --color-primary-dark: ${theme.primaryDark};
    --gradient-from: ${theme.gradientFrom};
    --gradient-to: ${theme.gradientTo};
  `;
}
