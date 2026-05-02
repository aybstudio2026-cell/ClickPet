import { theme } from './theme'
import { CSSProperties } from 'react'

export const dashboardStyles: Record<string, CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    fontFamily: theme.font.family,
    background: theme.colors.bgBase,
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: '200px',
    flexShrink: 0,
    background: theme.colors.bgCard,
    borderRight: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0.75rem',
    gap: '4px',
  },

  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px 1.25rem 8px',
    borderBottom: `1px solid ${theme.colors.border}`,
    marginBottom: '8px',
  },

  sidebarLogoIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },

  sidebarLogoText: {
    fontSize: theme.font.sizes.lg,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    margin: 0,
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: theme.radius.md,
    border: 'none',
    background: 'transparent',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.medium,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s',
  },

  navItemActive: {
    background: `linear-gradient(135deg, ${theme.colors.primary}30 0%, ${theme.colors.primary}15 100%)`,
    color: theme.colors.primaryDark,
    fontWeight: theme.font.weights.semibold,
  },

  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },

  navSpacer: {
    flex: 1,
  },

  navDivider: {
    height: '1px',
    background: theme.colors.border,
    margin: '6px 0',
  },

  // Main content
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  // Header
  header: {
    padding: '1.25rem 1.5rem 0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  welcomeText: {
    fontSize: theme.font.sizes.xxl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },

  welcomeSub: {
    fontSize: theme.font.sizes.md,
    color: theme.colors.textMuted,
    margin: 0,
  },

  balancePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.full,
    padding: '8px 16px',
    boxShadow: theme.shadow.sm,
  },

  balanceIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FFD6BA 0%, #FFB347 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },

  balanceAmount: {
    fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
  },

  balanceLabel: {
    fontSize: theme.font.sizes.sm,
    color: theme.colors.textMuted,
  },

  // Content area
  content: {
    flex: 1,
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  // Pet card
  petCard: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: '1.5rem',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
  },

  petImageBox: {
    width: '110px',
    height: '110px',
    borderRadius: theme.radius.lg,
    background: theme.colors.bgBase,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
    flexShrink: 0,
    border: `1px solid ${theme.colors.border}`,
  },

  petCardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  petCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  petCardName: {
    fontSize: theme.font.sizes.xxl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    margin: 0,
  },

  stageBadge: {
    background: theme.colors.secondary,
    color: theme.colors.secondaryDark,
    borderRadius: theme.radius.full,
    padding: '3px 12px',
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.semibold,
  },

  clicksRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: theme.font.sizes.md,
    color: theme.colors.textSecondary,
  },

  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.font.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: '4px',
  },

  progressBg: {
    height: '8px',
    background: theme.colors.bgBase,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.border}`,
  },

  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    borderRadius: theme.radius.full,
    transition: 'width 0.4s ease',
  },

  btnShow: {
    padding: '11px 24px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    color: theme.colors.textOnDark,
    fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    alignSelf: 'flex-start',
    transition: 'opacity 0.15s',
    marginTop: '4px',
  },

  btnHide: {
    padding: '11px 24px',
    borderRadius: theme.radius.full,
    border: `1.5px solid ${theme.colors.border}`,
    background: theme.colors.bgBase,
    color: theme.colors.textMuted,
    fontWeight: theme.font.weights.semibold,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    alignSelf: 'flex-start',
    marginTop: '4px',
  },

  // Stats row
  statsRow: {
    display: 'flex',
    gap: '0.75rem',
  },

  statCard: {
    flex: 1,
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '1rem',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: theme.shadow.sm,
  },

  statLabel: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    fontWeight: theme.font.weights.medium,
  },

  statValue: {
    fontSize: theme.font.sizes.xl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
  },

  statSub: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
  },

  // Pociones mini
  potionBar: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '0.875rem 1.25rem',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: theme.shadow.sm,
  },

  potionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  potionIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: theme.radius.sm,
    background: `${theme.colors.primary}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },

  potionText: {
    fontSize: theme.font.sizes.md,
    fontWeight: theme.font.weights.medium,
    color: theme.colors.textPrimary,
  },

  potionSub: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textMuted,
  },

  potionActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },

  btnSecondary: {
    padding: '7px 14px',
    borderRadius: theme.radius.md,
    border: `1.5px solid ${theme.colors.border}`,
    background: 'transparent',
    color: theme.colors.textSecondary,
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.medium,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },

  btnAccent: {
    padding: '7px 14px',
    borderRadius: theme.radius.md,
    border: 'none',
    background: theme.colors.primary,
    color: theme.colors.primaryDeep,
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.bold,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },

  // Toast
  evolveToast: {
    position: 'fixed' as const,
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: theme.colors.secondary,
    color: theme.colors.secondaryDark,
    padding: '10px 20px',
    borderRadius: theme.radius.full,
    fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base,
    zIndex: 999,
    whiteSpace: 'nowrap' as const,
    boxShadow: theme.shadow.md,
    border: `1px solid ${theme.colors.secondaryDark}30`,
  },

  // Mascotas view
  petsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: '1rem',
    alignItems: 'start',
  },

  activePetBig: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: '1.5rem',
    border: `2px solid ${theme.colors.primary}`,
    boxShadow: theme.shadow.md,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },

  activePetImageBox: {
    width: '100%',
    height: '140px',
    borderRadius: theme.radius.lg,
    background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.secondary}20 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '80px',
    border: `1px solid ${theme.colors.border}`,
  },

  otherPetsPanel: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: '1rem',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },

  otherPetChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.bgBase,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  otherPetEmoji: {
    fontSize: '28px',
    width: '40px',
    height: '40px',
    borderRadius: theme.radius.sm,
    background: theme.colors.bgCard,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  emptyPetsMsg: {
    textAlign: 'center' as const,
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
  },

  // Inventario view
  inventoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
  },

  inventoryItem: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '0.75rem',
    border: `1.5px dashed ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    position: 'relative' as const,
  },

  inventoryItemSelected: {
    border: `1.5px solid ${theme.colors.primary}`,
    background: `${theme.colors.primary}10`,
  },

  inventoryItemIcon: {
    fontSize: '36px',
    lineHeight: 1,
  },

  inventoryItemName: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    fontWeight: theme.font.weights.medium,
    lineHeight: 1.3,
  },

  inventoryItemQty: {
    position: 'absolute' as const,
    bottom: '6px',
    right: '8px',
    fontSize: '10px',
    fontWeight: theme.font.weights.bold,
    color: theme.colors.primaryDark,
  },

  inventoryUseBar: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '1rem 1.25rem',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: theme.shadow.sm,
    marginTop: '0.25rem',
  },

  // Tienda view
  shopTabs: {
    display: 'flex',
    gap: '4px',
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '4px',
    border: `1px solid ${theme.colors.border}`,
  },

  shopTab: {
    flex: 1,
    padding: '7px 10px',
    borderRadius: '9px',
    border: 'none',
    background: 'transparent',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.sm,
    fontWeight: theme.font.weights.medium,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  },

  shopTabActive: {
    background: theme.colors.primary,
    color: theme.colors.primaryDeep,
    fontWeight: theme.font.weights.bold,
  },

  shopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },

  shopItem: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: '1rem 0.75rem',
    border: `1.5px dashed ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  shopItemIcon: {
    fontSize: '42px',
    lineHeight: 1,
  },

  shopItemName: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    fontWeight: theme.font.weights.medium,
    lineHeight: 1.3,
  },

  shopItemPrice: {
    fontSize: theme.font.sizes.xs,
    color: theme.colors.primaryDark,
    fontWeight: theme.font.weights.bold,
  },

  shopItemBuyBtn: {
    width: '100%',
    padding: '5px',
    borderRadius: theme.radius.sm,
    border: 'none',
    background: theme.colors.primary,
    color: theme.colors.primaryDeep,
    fontSize: '11px',
    fontWeight: theme.font.weights.bold,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    marginTop: '2px',
  },

  // Detalle producto
  productDetail: {
    background: theme.colors.bgCard,
    borderRadius: theme.radius.xl,
    padding: '1.5rem',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadow.sm,
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },

  productImageBox: {
    width: '160px',
    height: '160px',
    borderRadius: theme.radius.lg,
    background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.secondary}20 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '80px',
    flexShrink: 0,
    border: `1px solid ${theme.colors.border}`,
  },

  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },

  productTag: {
    display: 'inline-block',
    background: theme.colors.secondary,
    color: theme.colors.secondaryDark,
    borderRadius: theme.radius.full,
    padding: '3px 12px',
    fontSize: '11px',
    fontWeight: theme.font.weights.semibold,
    alignSelf: 'flex-start',
  },

  productName: {
    fontSize: theme.font.sizes.xxl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },

  productPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: theme.font.sizes.xl,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.primaryDark,
  },

  productDesc: {
    fontSize: theme.font.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  productEffects: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },

  productEffectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: theme.font.sizes.sm,
    color: theme.colors.textSecondary,
  },

  productQtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '4px',
  },

  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: theme.colors.bgBase,
    borderRadius: theme.radius.md,
    padding: '6px 12px',
    border: `1px solid ${theme.colors.border}`,
  },

  qtyBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.bgCard,
    color: theme.colors.textPrimary,
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.font.family,
    lineHeight: 1,
  },

  qtyNum: {
    fontSize: theme.font.sizes.base,
    fontWeight: theme.font.weights.bold,
    color: theme.colors.textPrimary,
    minWidth: '20px',
    textAlign: 'center' as const,
  },

  btnBuyNow: {
    flex: 1,
    padding: '11px 24px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    color: theme.colors.textOnDark,
    fontWeight: theme.font.weights.bold,
    fontSize: theme.font.sizes.base,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    fontSize: theme.font.sizes.md,
    cursor: 'pointer',
    fontFamily: theme.font.family,
    padding: '4px 0',
    marginBottom: '4px',
  },
}