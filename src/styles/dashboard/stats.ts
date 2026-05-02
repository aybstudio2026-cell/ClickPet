import { theme } from '../theme'
import { CSSProperties } from 'react'

export const statsStyles: Record<string, CSSProperties> = {
  statsRow: { display: 'flex', gap: '0.75rem' },
  statCard: {
    flex: 1, background: theme.colors.bgCard, borderRadius: theme.radius.lg,
    padding: '1rem', border: `1px solid ${theme.colors.border}`,
    display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: theme.shadow.sm,
  },
  statLabel: {
    fontSize: theme.font.sizes.xs, color: theme.colors.textMuted,
    textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    fontWeight: theme.font.weights.medium,
  },
  statValue: { fontSize: theme.font.sizes.xl, fontWeight: theme.font.weights.bold, color: theme.colors.textPrimary },
  statSub: { fontSize: theme.font.sizes.xs, color: theme.colors.textMuted },
  potionBar: {
    background: theme.colors.bgCard, borderRadius: theme.radius.lg,
    padding: '0.875rem 1.25rem', border: `1px solid ${theme.colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: theme.shadow.sm,
  },
  potionLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  potionIconBox: {
    width: '32px', height: '32px', borderRadius: theme.radius.sm,
    background: `${theme.colors.primary}20`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
  },
  potionText: { fontSize: theme.font.sizes.md, fontWeight: theme.font.weights.medium, color: theme.colors.textPrimary },
  potionSub: { fontSize: theme.font.sizes.xs, color: theme.colors.textMuted },
  potionActions: { display: 'flex', gap: '8px', alignItems: 'center' },
}