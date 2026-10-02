import type { Palette, Theme } from '../contracts';
import { deriveTheme } from '../theme/derive';

// Dos paletas sintéticas con los seis roles totalmente distintos entre sí (regla de oro).
const A: Palette = {
  id: 'C01', name: 'Test A', reg: 50, concept: '', risk: '',
  light: { bg: '#F1E9D2', surface: '#FBF6E6', ink: '#1A2B3C', muted: '#53606B', primary: '#2E5D8A', accent: '#C0392B' },
  dark: { bg: '#10202E', surface: '#18303F', ink: '#EAE2CC', muted: '#A2B0B8', primary: '#7FB0DC', accent: '#E8705F' },
};
const B: Palette = {
  id: 'C02', name: 'Test B', reg: 50, concept: '', risk: '',
  light: { bg: '#E6F4EA', surface: '#F5FBF7', ink: '#14281C', muted: '#4B6455', primary: '#2F7A4B', accent: '#8E44AD' },
  dark: { bg: '#0F1F16', surface: '#17301F', ink: '#DCEFE2', muted: '#97B3A0', primary: '#6FCB8E', accent: '#C58AE0' },
};
export const themeA: Theme = deriveTheme(A, 'light');
export const themeB: Theme = deriveTheme(B, 'dark');
