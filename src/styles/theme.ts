export const theme = {
  colors: {
    // Paleta principal
    primary: '#B8C0FF',
    primaryDark: '#3D4B9E',
    primaryDeep: '#2D3A8C',

    secondary: '#C8E7D1',
    secondaryDark: '#2D6B45',

    tertiary: '#FFD6BA',
    tertiaryDark: '#8B4513',

    neutral: '#78767B',
    neutralLight: '#F0EFF5',
    neutralDark: '#2C2B30',

    // Backgrounds
    bgBase: '#F4F3FA',
    bgCard: '#FFFFFF',
    bgCardHover: '#F9F8FF',
    bgOverlay: 'rgba(60,55,120,0.08)',

    // Text
    textPrimary: '#1A1A2E',
    textSecondary: '#4A4A6A',
    textMuted: '#78767B',
    textOnPrimary: '#FFFFFF',
    textOnDark: '#F0EFF5',

    // States
    success: '#C8E7D1',
    successText: '#2D6B45',
    error: '#FFD6D6',
    errorText: '#8B2020',
    warning: '#FFD6BA',
    warningText: '#8B4513',

    // Borders
    border: '#E8E7F0',
    borderFocus: '#B8C0FF',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '999px',
  },

  shadow: {
    sm: '0 2px 8px rgba(60,55,120,0.08)',
    md: '0 4px 16px rgba(60,55,120,0.12)',
    lg: '0 8px 32px rgba(60,55,120,0.16)',
  },

  font: {
    family: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    sizes: {
      xs: '11px',
      sm: '12px',
      md: '13px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '22px',
      hero: '28px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
}

export type Theme = typeof theme