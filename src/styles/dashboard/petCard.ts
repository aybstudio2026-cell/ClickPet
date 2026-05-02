import { theme } from '../theme'
import { CSSProperties } from 'react'

export const petCardStyles: Record<string, CSSProperties> = {
  petCard: {
    background: theme.colors.bgCard, borderRadius: theme.radius.xl,
    padding: '1.5rem', display: 'flex', gap: '1.5rem',
    alignItems: 'center', border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
  },
  petImageBox: {
    width: '110px', height: '110px', borderRadius: theme.radius.lg,
    background: theme.colors.bgBase, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '64px', flexShrink: 0,
    border: `1px solid ${theme.colors.border}`,
  },
  petCardInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  petCardTop: { display: 'flex', alignItems: 'center', gap: '10px' },
  petCardName: {
    fontSize: theme.font.sizes.xxl, fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary, margin: 0,
  },
  stageBadge: {
    background: theme.colors.secondary, color: theme.colors.secondaryDark,
    borderRadius: theme.radius.full, padding: '3px 12px',
    fontSize: theme.font.sizes.sm, fontWeight: theme.font.weights.semibold,
  },
  activeBadge: {
    fontSize: '11px', color: '#3D4B9E',
    background: '#B8C0FF30', padding: '2px 8px',
    borderRadius: '999px', fontWeight: 600,
  },
  clicksRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: theme.font.sizes.md, color: theme.colors.textSecondary,
  },
  progressLabel: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: theme.font.sizes.sm, color: theme.colors.textMuted, marginTop: '4px',
  },
  progressBg: {
    height: '8px', background: theme.colors.bgBase,
    borderRadius: theme.radius.full, overflow: 'hidden',
    border: `1px solid ${theme.colors.border}`,
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    borderRadius: theme.radius.full, transition: 'width 0.4s ease',
  },
  progressHint: { fontSize: '11px', color: '#78767B', marginTop: '2px' },
  btnShow: {
    padding: '11px 24px', borderRadius: theme.radius.full, border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    color: theme.colors.textOnDark, fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base, cursor: 'pointer',
    fontFamily: theme.font.family, alignSelf: 'flex-start',
    transition: 'opacity 0.15s', marginTop: '4px',
  },
  btnHide: {
    padding: '11px 24px', borderRadius: theme.radius.full,
    border: `1.5px solid ${theme.colors.border}`,
    background: theme.colors.bgBase, color: theme.colors.textMuted,
    fontWeight: theme.font.weights.semibold, fontSize: theme.font.sizes.base,
    cursor: 'pointer', fontFamily: theme.font.family,
    alignSelf: 'flex-start', marginTop: '4px',
  },
  // Mascotas view
  petsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 220px',
    gap: '1rem', alignItems: 'start',
  },
  activePetBig: {
    background: theme.colors.bgCard, borderRadius: theme.radius.xl,
    padding: '1.5rem', border: `2px solid ${theme.colors.primary}`,
    boxShadow: theme.shadow.md, display: 'flex',
    flexDirection: 'column' as const, gap: '1rem',
  },
  activePetImageBox: {
    width: '100%', height: '140px', borderRadius: theme.radius.lg,
    background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.secondary}20 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '80px', border: `1px solid ${theme.colors.border}`,
  },
  otherPetsPanel: {
    background: theme.colors.bgCard, borderRadius: theme.radius.xl,
    padding: '1rem', border: `1px solid ${theme.colors.border}`,
    display: 'flex', flexDirection: 'column' as const, gap: '0.5rem',
  },
  otherPetChip: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 10px', borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.bgBase, cursor: 'pointer', transition: 'all 0.15s',
  },
  otherPetEmoji: {
    fontSize: '28px', width: '40px', height: '40px',
    borderRadius: theme.radius.sm, background: theme.colors.bgCard,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emptyPetsMsg: {
    textAlign: 'center' as const, padding: '1.5rem 1rem',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: '8px',
  },
}