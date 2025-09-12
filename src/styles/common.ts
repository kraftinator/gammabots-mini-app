import { CSSProperties } from 'react'

// Colors
export const colors = {
  primary: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#8b5cf6',
  success: '#34c759',
  warning: '#ff9500',
  error: '#ff3b30',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  text: {
    primary: '#1c1c1e',
    secondary: '#8e8e93',
    tertiary: '#666666',
    white: '#ffffff'
  },
  background: {
    primary: '#f5f5f5',
    card: '#ffffff',
    dark: '#111111',
    darkCard: '#222222',
    border: '#f2f2f7'
  }
} as const

// Common styles
export const styles = {
  // Layout
  container: {
    maxWidth: "420px",
    margin: "0 auto",
    background: colors.background.primary,
    minHeight: "100vh",
    position: "relative" as const
  },

  contentPadding: {
    padding: "20px 16px 100px"
  },

  // Cards
  card: {
    background: colors.background.card,
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.05)"
  },

  metricCard: {
    background: colors.background.card,
    borderRadius: "16px",
    padding: "16px 12px",
    textAlign: "center" as const,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    height: "84px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between"
  },

  activityCard: {
    background: colors.background.card,
    borderRadius: "20px",
    marginBottom: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(0, 0, 0, 0.05)"
  },

  darkCard: {
    backgroundColor: colors.background.dark,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px"
  },

  darkCardSmall: {
    backgroundColor: colors.background.darkCard,
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    border: "1px solid #333"
  },

  // Buttons
  buttonPrimary: {
    padding: "16px 20px",
    borderRadius: "25px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "700",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center" as const,
    background: colors.primary,
    color: colors.white
  },

  buttonSecondary: {
    padding: "16px 20px",
    borderRadius: "25px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "700",
    fontSize: "15px",
    border: `2px solid ${colors.primary}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center" as const,
    background: colors.white,
    color: colors.primary,
    boxSizing: "border-box" as const
  },

  // Navigation
  bottomNav: {
    position: "fixed" as const,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "420px",
    maxWidth: "100vw",
    background: colors.white,
    borderTop: `1px solid ${colors.background.border}`,
    display: "flex",
    zIndex: 5,
    boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "20px 20px 0 0"
  },

  navItem: {
    flex: 1,
    padding: "12px 8px 16px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "8px 4px",
    position: "relative" as const,
    textDecoration: "none"
  },

  navItemActive: {
    color: colors.secondary
  },

  navItemInactive: {
    color: colors.text.secondary
  },

  navIndicator: {
    content: '',
    position: "absolute" as const,
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "20px",
    height: "3px",
    background: colors.secondary,
    borderRadius: "1px"
  },

  // Typography
  heading1: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
    color: colors.white
  },

  heading2: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 16px 0",
    color: colors.text.primary
  },

  heading3: {
    fontSize: "18px",
    fontWeight: "700",
    color: colors.text.primary
  },

  textPrimary: {
    color: colors.text.primary
  },

  textSecondary: {
    color: colors.text.secondary
  },

  textSmall: {
    fontSize: "11px",
    color: colors.text.secondary,
    fontWeight: "500"
  },

  // Hero gradient
  heroGradient: {
    background: "linear-gradient(135deg, #00d9ff 0%, #a78bfa 100%)",
    padding: "32px 20px 20px",
    textAlign: "center" as const,
    color: colors.white,
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: "24px 24px 0 0",
    marginTop: "16px"
  },

  // Logo
  logo: {
    width: "80px",
    height: "80px",
    background: colors.primaryDark,
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "900",
    color: colors.white,
    margin: "0 auto 16px",
    border: `3px solid ${colors.primary}`,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
  },

  // Loading states
  loadingContainer: {
    padding: "20px",
    textAlign: "center" as const,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black
  },

  loadingContainerLight: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #00d9ff 0%, #a78bfa 100%)"
  },

  // Form styles
  formContainer: {
    minHeight: "100vh",
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
    padding: "20px",
    paddingBottom: "80px"
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px"
  },

  formTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    color: colors.text.primary
  },

  formSubtitle: {
    margin: 0,
    color: colors.text.secondary,
    fontSize: "14px"
  },

  formCard: {
    backgroundColor: colors.background.card,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: `1px solid ${colors.background.border}`
  },

  formGroup: {
    marginBottom: "20px"
  },

  formLabel: {
    display: "block",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "8px",
    color: colors.text.primary
  },

  formInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: colors.background.card,
    color: colors.text.primary,
    fontSize: "16px",
    boxSizing: "border-box" as const,
    outline: "none"
  },

  formSelect: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: colors.background.card,
    color: colors.text.primary,
    fontSize: "16px",
    boxSizing: "border-box" as const,
    outline: "none",
    appearance: "none" as const
  },

  submitButton: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    outline: "none"
  },

  submitButtonDisabled: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#cccccc",
    color: "#666666",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "not-allowed",
    outline: "none"
  },

  errorCard: {
    backgroundColor: "#332211",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: "1px solid #664433"
  },

  errorTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    color: "#ffaa44"
  },

  errorText: {
    color: "#ffaa44",
    margin: 0,
    fontSize: "14px"
  },
  
  // My Bots page styles
  myBotsContainer: {
    maxWidth: '420px',
    margin: '0 auto',
    background: '#f5f5f5',
    minHeight: '100vh',
    position: 'relative' as const,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  } as CSSProperties,

  myBotsHeader: {
    background: 'linear-gradient(135deg, #00d9ff 0%, #a78bfa 100%)',
    padding: '32px 20px 20px',
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: '24px 24px 0 0',
    marginTop: '16px'
  } as CSSProperties,

  myBotsLogo: {
    width: '80px',
    height: '80px',
    background: '#1e3a8a',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: '900',
    color: 'white',
    margin: '0 auto 16px',
    border: '3px solid #3b82f6',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
  } as CSSProperties,

  myBotsTitle: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
    textAlign: 'center' as const
  } as CSSProperties,

  myBotsSubtitle: {
    fontSize: '16px',
    fontWeight: '500',
    opacity: '0.9',
    textAlign: 'center' as const
  } as CSSProperties,

  myBotsUserInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px'
  } as CSSProperties,

  myBotsUsername: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  } as CSSProperties,

  myBotsBalance: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#ffffff'
  } as CSSProperties,

  myBotsBalanceAmount: {
    fontWeight: '700',
    fontSize: '14px'
  } as CSSProperties,

  myBotsFilters: {
    padding: '20px 16px',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
  } as CSSProperties,

  myBotsSearchContainer: {
    position: 'relative' as const,
    marginBottom: '16px'
  } as CSSProperties,

  myBotsSearchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: '15px',
    border: '1px solid #f2f2f7',
    borderRadius: '16px',
    background: '#f9f9f9',
    fontFamily: "'Inter', sans-serif",
    outline: 'none'
  } as CSSProperties,

  myBotsSearchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    color: '#8e8e93'
  } as CSSProperties,

  myBotsSelectContainer: {
    display: 'flex',
    gap: '12px'
  } as CSSProperties,

  myBotsSelect: {
    flex: 1,
    padding: '12px',
    border: '1px solid #f2f2f7',
    borderRadius: '16px',
    background: '#f9f9f9',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    outline: 'none'
  } as CSSProperties,

  myBotsList: {
    padding: '20px 16px 120px'
  } as CSSProperties,

  myBotCard: {
    background: 'white',
    borderRadius: '20px',
    marginBottom: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    padding: '20px',
    cursor: 'pointer'
  } as CSSProperties,

  myBotCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  } as CSSProperties,

  myBotInfo: {
    flex: 1
  } as CSSProperties,

  myBotHeader: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1c1c1e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f2f2f7'
  } as CSSProperties,

  myBotTokenInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px'
  } as CSSProperties,

  myBotId: {
    fontSize: '11px',
    color: '#8e8e93',
    fontWeight: '500'
  } as CSSProperties,

  myBotStatus: {
    fontSize: '11px',
    fontWeight: '500'
  } as CSSProperties,

  myBotDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
    fontSize: '11px'
  } as CSSProperties,

  myBotDetailRow: {
    display: 'flex',
    gap: '8px'
  } as CSSProperties,

  myBotDetailLabel: {
    color: '#8e8e93',
    width: '65px'
  } as CSSProperties,

  myBotDetailValue: {
    fontWeight: '600',
    color: '#1c1c1e'
  } as CSSProperties,

  myBotHoldings: {
    fontWeight: '600',
    color: '#1c1c1e'
  } as CSSProperties,

  myBotValues: {
    textAlign: 'right' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center'
  } as CSSProperties,

  myBotValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: '2px'
  } as CSSProperties,

  myBotProfit: {
    fontSize: '16px',
    fontWeight: '500'
  } as CSSProperties
} as const

// Utility functions
export const getChangeColor = (changeValue?: string) => {
  if (!changeValue || changeValue === "") return colors.success
  if (changeValue.startsWith("-")) return colors.error
  return colors.success
}

export const getCircleColor = (action: string) => {
  return action === "Sold" ? colors.primary : "#a855f7"
}

export const getRankColor = (tailwindColor: string) => {
  switch(tailwindColor) {
    case 'bg-orange-500': return colors.warning
    case 'bg-gray-500': return colors.text.secondary
    case 'bg-yellow-600': return '#d2691e'
    default: return colors.text.secondary
  }
}

// Helper function to get profit color
export const getProfitColor = (profit: number) => {
  if (profit > 0) return '#34c759'
  if (profit < 0) return '#ff3b30'
  return '#8e8e93'
}