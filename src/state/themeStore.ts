import { create } from 'zustand';

export type AppPalette = {
  bg: string;
  panel: string;
  panelAlt: string;
  border: string;
  accent: string;
  accentDark: string;
  text: string;
  subtle: string;
  danger: string;
  warning: string;
  success: string;
  info: string;
  pastelBlue: string;
  pastelBlueDark: string;
  pastelYellow: string;
  pastelYellowDark: string;
  pastelMint: string;
  pastelPeach: string;
  pastelPurple: string;
  pastelPink: string;
  pastelPinkDark: string;
};

const palettes: Record<string, AppPalette> = {
  default: {
    bg: '#F4E8FD', panel: '#F9D9E7', panelAlt: '#F6D1E1', border: '#E8AFC5',
    accent: '#FF6FA5', accentDark: '#E2558B', text: '#402631', subtle: '#7A4F62',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#E8F4FD', pastelBlueDark: '#D1E9FB', pastelYellow: '#FDF9E8', pastelYellowDark: '#FBF2D1',
    pastelMint: '#E8FDF4', pastelPeach: '#FDF0E8', pastelPurple: '#F4E8FD', pastelPink: '#FDE8F4', pastelPinkDark: '#F5C2E7'
  },
  dark: {
    bg: '#181825', panel: '#232634', panelAlt: '#2b2e3b', border: '#3b3f52',
    accent: '#FF6FA5', accentDark: '#E2558B', text: '#ECECEC', subtle: '#B6B6B6',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#2a3340', pastelBlueDark: '#202635', pastelYellow: '#3a3626', pastelYellowDark: '#2e2a1f',
    pastelMint: '#23322a', pastelPeach: '#342826', pastelPurple: '#1f1b28', pastelPink: '#2a1f27', pastelPinkDark: '#3b2a34'
  },
  spring: {
    bg: '#E8FDF4', panel: '#FDF9E8', panelAlt: '#E9F9EF', border: '#B6E2D3',
    accent: '#FFB7B2', accentDark: '#E49A95', text: '#40504a', subtle: '#6b7d73',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#E8F4FD', pastelBlueDark: '#D1E9FB', pastelYellow: '#FDF9E8', pastelYellowDark: '#FBF2D1',
    pastelMint: '#E8FDF4', pastelPeach: '#FDF0E8', pastelPurple: '#F4E8FD', pastelPink: '#FDE8F4', pastelPinkDark: '#F5C2E7'
  },
  summer: {
    bg: '#FDF0E8', panel: '#FDF9E8', panelAlt: '#FFF4D6', border: '#F4B75D',
    accent: '#FF6FA5', accentDark: '#E2558B', text: '#402631', subtle: '#7A4F62',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#E8F4FD', pastelBlueDark: '#D1E9FB', pastelYellow: '#FDF9E8', pastelYellowDark: '#FBF2D1',
    pastelMint: '#E8FDF4', pastelPeach: '#FDF0E8', pastelPurple: '#F4E8FD', pastelPink: '#FDE8F4', pastelPinkDark: '#F5C2E7'
  },
  autumn: {
  bg: '#FFF4E6', panel: '#F9E0B5', panelAlt: '#F2C97D', border: '#D6A96E',
  accent: '#E67E22', accentDark: '#BF6516', text: '#3B2A1A', subtle: '#7B5E3B',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#E8F4FD', pastelBlueDark: '#D1E9FB', pastelYellow: '#FDF9E8', pastelYellowDark: '#FBF2D1',
    pastelMint: '#E8FDF4', pastelPeach: '#FDF0E8', pastelPurple: '#F4E8FD', pastelPink: '#FDE8F4', pastelPinkDark: '#F5C2E7'
  },
  winter: {
    bg: '#E8F4FD', panel: '#D1E9FB', panelAlt: '#E6F1FF', border: '#B8D3F5',
    accent: '#5BC0DE', accentDark: '#4aa6c3', text: '#2c3d4a', subtle: '#566b7a',
    danger: '#E24C5E', warning: '#F4B75D', success: '#58B26B', info: '#5BC0DE',
    pastelBlue: '#E8F4FD', pastelBlueDark: '#D1E9FB', pastelYellow: '#FDF9E8', pastelYellowDark: '#FBF2D1',
    pastelMint: '#E8FDF4', pastelPeach: '#FDF0E8', pastelPurple: '#F4E8FD', pastelPink: '#FDE8F4', pastelPinkDark: '#F5C2E7'
  }
};

interface ThemeState {
  key: string;
  palette: AppPalette;
  setPaletteByKey: (key: keyof typeof palettes) => void;
}

const useThemeStore = create<ThemeState>((set, get) => ({
  key: 'default',
  palette: palettes.default,
  setPaletteByKey: (key) => {
    const p = palettes[key] || palettes.default;
    set({ key, palette: p });
    // persist asynchronously without blocking UI
    import('../db/database').then(({ setMeta }) => setMeta('appPalette', key as string)).catch(() => {});
  }
}));

// On module load, try to load persisted palette
import('../db/database')
  .then(async ({ getMeta }) => {
    const saved = await getMeta('appPalette');
    if (saved) {
      const p = palettes[saved] || palettes.default;
      useThemeStore.setState({ key: saved, palette: p });
    }
  })
  .catch(() => {});

export { palettes };
export default useThemeStore;
