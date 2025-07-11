import { config } from '@tamagui/config/v3'
import { createTamagui, createTokens } from '@tamagui/core'

// Custom tokens based on your green theme
const tokens = createTokens({
  color: {
    // Your custom green palette
    darkGreen: '#001711',
    mediumGreen: '#003030', 
    lightGreen: '#58E886',
    tealGreen: '#2ab78f',
    lightGray: '#D8DEE9',
    white: '#ECEFF4',
    
    // Extended palette for better theming
    darkGreen50: '#001711',
    darkGreen100: '#002922',
    darkGreen200: '#003030',
    darkGreen300: '#004a4a',
    
    lightGreen50: '#f0fdf4',
    lightGreen100: '#dcfce7',
    lightGreen200: '#bbf7d0',
    lightGreen300: '#86efac',
    lightGreen400: '#58E886',
    lightGreen500: '#22c55e',
    lightGreen600: '#16a34a',
    
    teal50: '#f0fdfa',
    teal100: '#ccfbf1',
    teal200: '#99f6e4',
    teal300: '#5eead4',
    teal400: '#2ab78f',
    teal500: '#14b8a6',
    teal600: '#0d9488',
    
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    true: 16,
  },
  radius: {
    0: 0,
    1: 3,
    2: 5,
    3: 7,
    4: 9,
    5: 10,
    6: 16,
    7: 19,
    8: 22,
    9: 26,
    10: 34,
    12: 42,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
})

// Custom themes
const lightTheme = {
  background: tokens.color.white,
  backgroundHover: tokens.color.gray50,
  backgroundPress: tokens.color.gray100,
  backgroundFocus: tokens.color.gray100,
  color: tokens.color.gray900,
  colorHover: tokens.color.gray800,
  colorPress: tokens.color.gray700,
  colorFocus: tokens.color.gray700,
  borderColor: tokens.color.gray200,
  borderColorHover: tokens.color.gray300,
  borderColorPress: tokens.color.gray400,
  borderColorFocus: tokens.color.lightGreen400,
  placeholderColor: tokens.color.gray400,
  primary: tokens.color.lightGreen400,
  primaryHover: tokens.color.lightGreen500,
  primaryPress: tokens.color.lightGreen600,
  secondary: tokens.color.teal400,
  secondaryHover: tokens.color.teal500,
  secondaryPress: tokens.color.teal600,
}

const darkTheme = {
  background: tokens.color.darkGreen,
  backgroundHover: tokens.color.darkGreen100,
  backgroundPress: tokens.color.darkGreen200,
  backgroundFocus: tokens.color.darkGreen200,
  color: tokens.color.lightGray,
  colorHover: tokens.color.white,
  colorPress: tokens.color.white,
  colorFocus: tokens.color.white,
  borderColor: tokens.color.darkGreen200,
  borderColorHover: tokens.color.mediumGreen,
  borderColorPress: tokens.color.lightGreen400,
  borderColorFocus: tokens.color.lightGreen400,
  placeholderColor: tokens.color.gray500,
  primary: tokens.color.lightGreen400,
  primaryHover: tokens.color.lightGreen300,
  primaryPress: tokens.color.lightGreen500,
  secondary: tokens.color.teal400,
  secondaryHover: tokens.color.teal300,
  secondaryPress: tokens.color.teal500,
}

export const tamaguiConfig = createTamagui({
  ...config,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    shouldAddPrefersColorThemes: true,
    themeClassNameOnRoot: true,
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
} 