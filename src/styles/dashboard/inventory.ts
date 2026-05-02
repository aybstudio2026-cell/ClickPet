import { theme } from '../theme'
import { CSSProperties } from 'react'

export const inventoryStyles: Record<string, CSSProperties> = {
  inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' },
  inventoryItem: {
    background: theme.colors.bgCard, borderRadius: theme.radius.lg, padding: '0.75rem',
    border: `1.5px dashed ${theme.colors.border}`, display: 'flex',
    flexDirection: 'column' as const, alignItems: 'center', gap: '6px',
    cursor: 'pointer', transition: 'all 0.15s', position: 'relative' as const,
  },
  inventoryItemIcon: { fontSize: '36px', lineHeight: 1 },
  inventoryItemName: {
    fontSize: theme.font.sizes.xs, color: theme.colors.textSecondary,
    textAlign: 'center' as const, fontWeight: theme.font.weights.medium, lineHeight: 1.3,
  },
  inventoryItemQty: {
    position: 'absolute' as const, bottom: '6px', right: '8px',
    fontSize: '10px', fontWeight: theme.font.weights.bold, color: theme.colors.primaryDark,
  },
  inventoryUseBar: {
    background: theme.colors.bgCard, borderRadius: theme.radius.lg,
    padding: '1rem 1.25rem', border: `1px solid ${theme.colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: theme.shadow.sm, marginTop: '0.25rem',
  },
  tabsRow: {
    display: 'flex', gap: '4px', background: '#fff',
    borderRadius: '12px', padding: '4px',
    border: '1px solid #E8E7F0', alignSelf: 'flex-start',
  },
  tabActive: {
    padding: '6px 16px', borderRadius: '9px', border: 'none',
    background: '#B8C0FF', color: '#2D3A8C', fontSize: '13px',
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
}