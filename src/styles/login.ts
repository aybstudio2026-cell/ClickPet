import { theme } from './theme'
import { CSSProperties } from 'react'

export const loginStyles: Record<string, CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'stretch',
    fontFamily: theme.font.family,
    overflow: 'hidden',
    background: theme.colors.bgBase,
  },

  card: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },

  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(120,118,123,0.15)',
    color: theme.colors.textMuted,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    fontFamily: theme.font.family,
    lineHeight: 1,
    transition: 'background 0.15s',
  },

  leftPanel: {
    width: '320px',
    flexShrink: 0,
    background: `linear-gradient(160deg, #B8C0FF 0%, #9BA8FF 50%, #C8E7D1 100%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
  },

  leftPet: {
    fontSize: '72px',
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 16px rgba(60,55,120,0.2))',
  },

  leftTitle: {
    fontSize: theme.font.sizes.xxl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.primaryDeep,
    margin: 0,
    textAlign: 'center',
  },

  leftSubtitle: {
    fontSize: theme.font.sizes.md,
    color: theme.colors.primaryDark,
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.6,
    opacity: 0.85,
  },

  leftDots: {
    display: 'flex',
    gap: '6px',
    marginTop: '0.5rem',
  },

  leftDot: {
    height: '8px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.4)',
    width: '8px',
  },

  rightPanel: {
    flex: 1,
    padding: '2.5rem 2.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '1rem',
    background: theme.colors.bgCard,
    overflowY: 'auto',
  },

  tabRow: {
    display: 'flex',
    background: theme.colors.bgBase,
    borderRadius: theme.radius.md,
    padding: '4px',
    gap: '4px',
  },

  tab: {
    flex: 1,
    padding: '8px',
    borderRadius: '9px',
    border: 'none',
    background: 'transparent',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.medium,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
  },

  tabActive: {
    background: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    fontWeight: theme.font.weights.semibold,
    boxShadow: theme.shadow.sm,
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  label: {
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.medium,
    color: theme.colors.textSecondary,
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '13px',
    color: theme.colors.textMuted,
    pointerEvents: 'none',
  },

  input: {
    width: '100%',
    padding: '10px 14px 10px 36px',
    borderRadius: theme.radius.sm,
    border: `1.5px solid ${theme.colors.border}`,
    background: theme.colors.bgBase,
    color: theme.colors.textPrimary,
    fontSize: theme.font.sizes.base,
    outline: 'none',
    fontFamily: theme.font.family,
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },

  btnPrimary: {
    width: '100%',
    padding: '12px',
    borderRadius: theme.radius.sm,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primaryDeep} 100%)`,
    color: theme.colors.textOnDark,
    fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.bold,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
    marginTop: '4px',
  },

  error: {
    background: theme.colors.error,
    color: theme.colors.errorText,
    borderRadius: theme.radius.sm,
    padding: '8px 12px',
    fontSize: theme.font.sizes.sm,
    textAlign: 'center',
  },

  hint: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: '4px',
  },

  hintLink: {
    color: theme.colors.primaryDark,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}