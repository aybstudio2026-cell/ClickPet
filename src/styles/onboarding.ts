import { theme } from './theme'
import { CSSProperties } from 'react'

export const onboardingStyles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26, 26, 46, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    fontFamily: theme.font.family,
  },

  card: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    width: '420px',
    overflow: 'hidden',
    boxShadow: theme.shadow.lg,
    border: `1px solid ${theme.colors.border}`,
  },

  // Panel superior con gradiente
  topPanel: {
    background: `linear-gradient(160deg, #B8C0FF 0%, #9BA8FF 50%, #C8E7D1 100%)`,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '180px',
    justifyContent: 'center',
  },

  stepEmoji: {
    fontSize: '64px',
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 12px rgba(60,55,120,0.2))',
    transition: 'all 0.3s ease',
  },

  stepNumber: {
    fontSize: theme.font.sizes.xs,
    fontWeight: theme.font.weights.bold,
    color: 'rgba(45,58,140,0.7)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    background: 'rgba(255,255,255,0.4)',
    padding: '3px 12px',
    borderRadius: theme.radius.full,
  },

  // Panel inferior con contenido
  bottomPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  stepTitle: {
    fontSize: theme.font.sizes.xxl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },

  stepDesc: {
    fontSize: theme.font.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },

  // Dots de progreso
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    margin: '4px 0',
  },

  dot: {
    height: '6px',
    borderRadius: '999px',
    transition: 'all 0.25s ease',
  },

  // Botones
  btnRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },

  btnNext: {
    flex: 1,
    padding: '11px',
    borderRadius: theme.radius.md,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primaryDeep} 100%)`,
    color: theme.colors.textOnDark,
    fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    transition: 'opacity 0.15s',
  },

  btnBack: {
    padding: '11px 16px',
    borderRadius: theme.radius.md,
    border: `1.5px solid ${theme.colors.border}`,
    background: 'transparent',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },

  btnFinish: {
    flex: 1,
    padding: '11px',
    borderRadius: theme.radius.md,
    border: 'none',
    background: `linear-gradient(135deg, #C8E7D1 0%, #9DD4AF 100%)`,
    color: theme.colors.secondaryDark,
    fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },

  skipBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.sm,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    textDecoration: 'underline',
    textAlign: 'center' as const,
    padding: '4px',
  },
}