import { theme } from '../theme'
import { CSSProperties } from 'react'

export const shopStyles: Record<string, CSSProperties> = {
  shopTabs: {
    display: 'flex', gap: '4px', background: theme.colors.bgCard,
    borderRadius: theme.radius.lg, padding: '4px',
    border: `1px solid ${theme.colors.border}`, alignSelf: 'flex-start',
  },
  shopTab: {
    padding: '7px 16px', borderRadius: '9px', border: 'none',
    background: 'transparent', color: theme.colors.textMuted,
    fontSize: theme.font.sizes.sm, fontWeight: theme.font.weights.medium,
    cursor: 'pointer', fontFamily: theme.font.family, transition: 'all 0.15s',
  },
  shopTabActive: {
    background: theme.colors.primary, color: theme.colors.primaryDeep,
    fontWeight: theme.font.weights.bold,
  },
  shopGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' },
  shopItem: {
    background: theme.colors.bgCard, borderRadius: theme.radius.lg,
    padding: '1rem 0.75rem', border: `1.5px dashed ${theme.colors.border}`,
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s',
  },
  shopItemIcon: { fontSize: '42px', lineHeight: 1 },
  shopItemName: {
    fontSize: theme.font.sizes.xs, color: theme.colors.textSecondary,
    textAlign: 'center' as const, fontWeight: theme.font.weights.medium, lineHeight: 1.3,
  },
  shopItemPrice: { fontSize: theme.font.sizes.xs, color: theme.colors.primaryDark, fontWeight: theme.font.weights.bold },
  shopItemBuyBtn: {
    width: '100%', padding: '5px', borderRadius: theme.radius.sm,
    border: 'none', background: theme.colors.primary,
    color: theme.colors.primaryDeep, fontSize: '11px',
    fontWeight: theme.font.weights.bold, cursor: 'pointer',
    fontFamily: theme.font.family, marginTop: '2px',
  },
  // Detalle
  productDetail: {
    background: theme.colors.bgCard, borderRadius: theme.radius.xl,
    padding: '1.5rem', border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm, display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
  },
  productImageBox: {
    width: '160px', height: '160px', borderRadius: theme.radius.lg,
    background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.secondary}20 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '80px', flexShrink: 0, border: `1px solid ${theme.colors.border}`,
  },
  productInfo: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
  productTag: {
    display: 'inline-block', background: theme.colors.secondary,
    color: theme.colors.secondaryDark, borderRadius: theme.radius.full,
    padding: '3px 12px', fontSize: '11px', fontWeight: theme.font.weights.semibold,
    alignSelf: 'flex-start',
  },
  productName: {
    fontSize: theme.font.sizes.xxl, fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary, margin: 0, lineHeight: 1.2,
  },
  productPrice: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: theme.font.sizes.xl, fontWeight: theme.font.weights.bold,
    color: theme.colors.primaryDark,
  },
  productDesc: { fontSize: theme.font.sizes.md, color: theme.colors.textSecondary, lineHeight: 1.6, margin: 0 },
  productEffects: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  productEffectRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: theme.font.sizes.sm, color: theme.colors.textSecondary },
  productQtyRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' },
  qtyControl: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: theme.colors.bgBase, borderRadius: theme.radius.md,
    padding: '6px 12px', border: `1px solid ${theme.colors.border}`,
  },
  qtyBtn: {
    width: '24px', height: '24px', borderRadius: '50%',
    border: `1px solid ${theme.colors.border}`, background: theme.colors.bgCard,
    color: theme.colors.textPrimary, fontSize: '16px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: theme.font.family, lineHeight: 1,
  },
  qtyNum: {
    fontSize: theme.font.sizes.base, fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary, minWidth: '20px', textAlign: 'center' as const,
  },
  btnBuyNow: {
    flex: 1, padding: '11px 24px', borderRadius: theme.radius.full, border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    color: theme.colors.textOnDark, fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base, cursor: 'pointer', fontFamily: theme.font.family,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', color: theme.colors.textMuted,
    fontSize: theme.font.sizes.md, cursor: 'pointer',
    fontFamily: theme.font.family, padding: '4px 0', marginBottom: '4px',
  },
  shopMsg: {
    padding: '8px 12px', borderRadius: '8px', fontSize: '13px', border: '1px solid',
  },
}