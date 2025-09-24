import { Platform } from 'react-native';

export const palette = {
  bg: '#F4E8FD',
  panel: '#F9D9E7',
  panelAlt: '#F6D1E1',
  border: '#E8AFC5',
  accent: '#FF6FA5',
  accentDark: '#E2558B',
  text: '#402631',
  subtle: '#7A4F62',
  danger: '#E24C5E',
  warning: '#F4B75D',
  success: '#58B26B',
  info: '#5BC0DE',
  // New pastel colors
  pastelBlue: '#E8F4FD',
  pastelBlueDark: '#D1E9FB',
  pastelYellow: '#FDF9E8',
  pastelYellowDark: '#FBF2D1',
  pastelMint: '#E8FDF4',
  pastelPeach: '#FDF0E8',
  pastelPurple: '#F4E8FD',
  pastelPink: '#FDE8F4',
  pastelPinkDark: '#F5C2E7'
};

// Pixelated/Minecraft-like font configuration
export const pixelFont = {
  // Exact Minecraft font
  fontFamily: 'Minecraft',
  // Fallback fonts if Minecraft font isn't loaded
  fallback: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'Courier'
  }),
  // For emphasis and titles
  heavy: 'Minecraft'
};

// Helper function to get font with fallback
export const getMinecraftFont = (fallbackToSystem = true) => {
  // In production, you might want to check if the font is loaded
  // For now, we'll return the Minecraft font name
  return fallbackToSystem ? pixelFont.fontFamily : pixelFont.fallback;
};

export const cardShadow = {
  shadowColor: '#E2558B',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
  elevation: 2
};
