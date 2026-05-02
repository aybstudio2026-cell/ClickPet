import { theme } from '../theme'
import { CSSProperties } from 'react'

export const layoutStyles: Record<string, CSSProperties> = {
  page: {
    width: '100vw', height: '100vh',
    display: 'flex', fontFamily: theme.font.family,
    background: theme.colors.bgBase, overflow: 'hidden',
  },
  sidebar: {
    width: '200px', flexShrink: 0,
    background: theme.colors.bgCard,
    borderRight: `1px solid ${theme.colors.border}`,
    display: 'flex', flexDirection: 'column',
    padding: '1.25rem 0.75rem', gap: '4px',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '4px 8px 1.25rem 8px',
    borderBottom: `1px solid ${theme.colors.border}`,
    marginBottom: '8px',
  },
  sidebarLogoIcon: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', flexShrink: 0,
  },
  sidebarLogoText: {
    fontSize: theme.font.sizes.lg, fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary, margin: 0,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: theme.radius.md,
    border: 'none', background: 'transparent',
    color: theme.colors.textMuted, fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.medium, cursor: 'pointer',
    fontFamily: theme.font.family, width: '100%',
    textAlign: 'left' as const, transition: 'all 0.15s',
  },
  navItemActive: {
    background: `linear-gradient(135deg, ${theme.colors.primary}30 0%, ${theme.colors.primary}15 100%)`,
    color: theme.colors.primaryDark, fontWeight: theme.font.weights.semibold,
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' as const, flexShrink: 0 },
  navSpacer: { flex: 1 },
  navDivider: { height: '1px', background: theme.colors.border, margin: '6px 0' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '1.25rem 1.5rem 0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  welcomeText: {
    fontSize: theme.font.sizes.xxl, fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary, margin: 0, lineHeight: 1.2,
  },
  welcomeSub: { fontSize: theme.font.sizes.md, color: theme.colors.textMuted, margin: 0 },
  balancePill: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.full, padding: '6px 14px',
    boxShadow: theme.shadow.sm,
  },
  balanceIcon: {
    width: '22px', height: '22px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: '10px', fontWeight: 700, color: '#78767B',
    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
    marginBottom: '1px',
  },
  balanceAmount: {
    fontSize: theme.font.sizes.base, fontWeight: theme.font.weights.bold,
    color: '#4CAF82', letterSpacing: '0.02em',
  },
  content: {
    flex: 1, padding: '1.25rem 1.5rem',
    overflowY: 'auto', display: 'flex',
    flexDirection: 'column', gap: '1rem',
  },
  evolveToast: {
    position: 'fixed' as const, top: 16, left: '50%',
    transform: 'translateX(-50%)',
    background: theme.colors.secondary, color: theme.colors.secondaryDark,
    padding: '10px 20px', borderRadius: theme.radius.full,
    fontWeight: theme.font.weights.bold, fontSize: theme.font.sizes.base,
    zIndex: 999, whiteSpace: 'nowrap' as const, boxShadow: theme.shadow.md,
    border: `1px solid ${theme.colors.secondaryDark}30`,
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: 600, color: '#1A1A2E', margin: 0,
  },
  btnSecondary: {
    padding: '7px 14px', borderRadius: theme.radius.md,
    border: `1.5px solid ${theme.colors.border}`,
    background: 'transparent', color: theme.colors.textSecondary,
    fontSize: theme.font.sizes.sm, fontWeight: theme.font.weights.medium,
    cursor: 'pointer', fontFamily: theme.font.family,
  },
  btnAccent: {
    padding: '7px 14px', borderRadius: theme.radius.md,
    border: 'none', background: theme.colors.primary,
    color: theme.colors.primaryDeep, fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.bold, cursor: 'pointer',
    fontFamily: theme.font.family,
  },
}