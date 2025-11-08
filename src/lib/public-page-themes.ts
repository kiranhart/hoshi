// Color mode for public pages
export type PublicPageColorMode = 'light' | 'dark' | 'neobrutalism';

export interface ThemeColors {
  // Background colors
  background: string;
  cardBackground: string;
  cardBorder: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  headingText: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  linkColor: string;
  linkHover: string;
  
  // Section colors
  sectionBackground: string;
  sectionBorder: string;
  
  // Icon colors
  iconBackground: string;
  iconColor: string;
  
  // Medicine field colors
  medicineDosageBg: string;
  medicineDosageIconBg: string;
  medicineDosageIconColor: string;
  medicineDosageLabel: string;
  medicineFrequencyBg: string;
  medicineFrequencyIconBg: string;
  medicineFrequencyIconColor: string;
  medicineFrequencyLabel: string;
  
  // Profile image border
  profileImageBorder: string;
}

export const publicPageColors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: 'bg-white',
    cardBackground: 'bg-white/80',
    cardBorder: 'border-gray-200',
    primaryText: 'text-gray-900',
    secondaryText: 'text-gray-600',
    headingText: 'text-gray-900',
    accent: 'from-rose-500 via-pink-500 to-rose-600',
    accentHover: 'from-rose-600 via-pink-600 to-rose-700',
    linkColor: 'text-cyan-600',
    linkHover: 'hover:text-cyan-700',
    sectionBackground: 'bg-white/80',
    sectionBorder: 'border-gray-200',
    iconBackground: 'from-rose-400 to-pink-500',
    iconColor: 'text-white',
    medicineDosageBg: 'bg-cyan-50',
    medicineDosageIconBg: 'bg-cyan-100',
    medicineDosageIconColor: 'text-cyan-600',
    medicineDosageLabel: 'text-cyan-700',
    medicineFrequencyBg: 'bg-blue-50',
    medicineFrequencyIconBg: 'bg-blue-100',
    medicineFrequencyIconColor: 'text-blue-600',
    medicineFrequencyLabel: 'text-blue-700',
    profileImageBorder: 'border-white',
  },
  dark: {
    background: 'bg-gray-900',
    cardBackground: 'bg-gray-800/80',
    cardBorder: 'border-gray-700',
    primaryText: 'text-gray-100',
    secondaryText: 'text-gray-300',
    headingText: 'text-gray-100',
    accent: 'from-rose-400 via-pink-400 to-rose-500',
    accentHover: 'from-rose-500 via-pink-500 to-rose-600',
    linkColor: 'text-cyan-400',
    linkHover: 'hover:text-cyan-300',
    sectionBackground: 'bg-gray-800/80',
    sectionBorder: 'border-gray-700',
    iconBackground: 'from-rose-500 to-pink-500',
    iconColor: 'text-white',
    medicineDosageBg: 'bg-cyan-900/30',
    medicineDosageIconBg: 'bg-cyan-800/50',
    medicineDosageIconColor: 'text-cyan-300',
    medicineDosageLabel: 'text-cyan-300',
    medicineFrequencyBg: 'bg-blue-900/30',
    medicineFrequencyIconBg: 'bg-blue-800/50',
    medicineFrequencyIconColor: 'text-blue-300',
    medicineFrequencyLabel: 'text-blue-300',
    profileImageBorder: 'border-gray-700',
  },
};

// Helper function to calculate luminance for contrast checking
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to get contrasting text color (black or white)
function getContrastText(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? 'text-gray-900' : 'text-white';
}

// Generate neobrutalism theme colors based on primary color
function generateNeobrutalismColors(primaryColor: string): ThemeColors {
  // Ensure primary color is valid hex
  const validColor = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
  const rgb = hexToRgb(validColor);
  
  if (!rgb) {
    // Fallback to default if invalid
    return generateNeobrutalismColors('#FF6B6B');
  }

  // Create darker and lighter variants
  const darkerR = Math.max(0, rgb.r - 40);
  const darkerG = Math.max(0, rgb.g - 40);
  const darkerB = Math.max(0, rgb.b - 40);
  const darkerHex = `#${[darkerR, darkerG, darkerB].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

  // Create darker variant for hover states

  return {
    background: 'bg-yellow-50', // Neobrutalism typically uses bright backgrounds
    cardBackground: 'bg-white',
    cardBorder: 'border-4 border-gray-900', // Thick black borders
    primaryText: 'text-gray-900', // Always black text for neobrutalism
    secondaryText: 'text-gray-700',
    headingText: 'text-gray-900',
    accent: validColor, // Will be used as inline style
    accentHover: darkerHex, // Will be used as inline style
    linkColor: 'text-blue-700', // Fallback, will be overridden with inline style
    linkHover: 'hover:text-blue-800', // Fallback, will be overridden with inline style
    sectionBackground: 'bg-white',
    sectionBorder: 'border-4 border-gray-900',
    iconBackground: validColor, // Will be used as inline style
    iconColor: getContrastText(validColor),
    medicineDosageBg: 'bg-cyan-50',
    medicineDosageIconBg: 'bg-cyan-100',
    medicineDosageIconColor: 'text-cyan-700',
    medicineDosageLabel: 'text-cyan-800',
    medicineFrequencyBg: 'bg-blue-50',
    medicineFrequencyIconBg: 'bg-blue-100',
    medicineFrequencyIconColor: 'text-blue-700',
    medicineFrequencyLabel: 'text-blue-800',
    profileImageBorder: 'border-4 border-gray-900',
    // Store custom color for inline styles
    _primaryColor: validColor,
    _darkerColor: darkerHex,
  } as ThemeColors & { _primaryColor?: string; _darkerColor?: string };
}

export function getThemeColors(colorMode: PublicPageColorMode, primaryColor?: string | null): ThemeColors {
  if (colorMode === 'neobrutalism') {
    return generateNeobrutalismColors(primaryColor || '#FF6B6B');
  }
  return publicPageColors[colorMode];
}

export function getColorModeForPage(colorMode: string | null | undefined): PublicPageColorMode {
  if (colorMode === 'light' || colorMode === 'dark' || colorMode === 'neobrutalism') {
    return colorMode;
  }
  return 'light'; // Default to light mode
}

