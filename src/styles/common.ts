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
  }
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