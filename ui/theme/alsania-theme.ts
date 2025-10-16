/**
 * Alsania Wallet Theme System
 * Modern, accessible, customizable theme
 */

import React from 'react';

export interface AlsaniaTheme {
  colors: {
    primary: Record<string, string>;
    background: Record<string, string>;
    text: Record<string, string>;
    border: Record<string, string>;
    success: Record<string, string>;
    error: Record<string, string>;
    warning: Record<string, string>;
  };
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

export const lightTheme: AlsaniaTheme = {
  colors: {
    primary: {
      default: '#7c3aed',
      hover: '#6d28d9',
      pressed: '#5b21b6',
      muted: '#ede9fe',
    },
    background: {
      default: '#ffffff',
      alternative: '#f9fafb',
      hover: '#f3f4f6',
      pressed: '#e5e7eb',
    },
    text: {
      default: '#111827',
      alternative: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      default: '#e5e7eb',
      muted: '#f3f4f6',
    },
    success: {
      default: '#10b981',
      muted: '#d1fae5',
    },
    error: {
      default: '#ef4444',
      muted: '#fee2e2',
    },
    warning: {
      default: '#f59e0b',
      muted: '#fef3c7',
    },
  },
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const darkTheme: AlsaniaTheme = {
  ...lightTheme,
  colors: {
    primary: {
      default: '#8b5cf6',
      hover: '#7c3aed',
      pressed: '#6d28d9',
      muted: '#2e1065',
    },
    background: {
      default: '#0a0a0a',
      alternative: '#1a1a1a',
      hover: '#2a2a2a',
      pressed: '#3a3a3a',
    },
    text: {
      default: '#f9fafb',
      alternative: '#d1d5db',
      muted: '#9ca3af',
      inverse: '#111827',
    },
    border: {
      default: '#374151',
      muted: '#1f2937',
    },
    success: {
      default: '#34d399',
      muted: '#064e3b',
    },
    error: {
      default: '#f87171',
      muted: '#7f1d1d',
    },
    warning: {
      default: '#fbbf24',
      muted: '#78350f',
    },
  },
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme: AlsaniaTheme): void => {
  const root = document.documentElement;

  // Colors
  Object.entries(theme.colors).forEach(([category, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      root.style.setProperty(`--color-${category}-${shade}`, value);
    });
  });

  // Typography
  Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
    root.style.setProperty(`--font-size-${size}`, value);
  });

  Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
    root.style.setProperty(`--font-weight-${weight}`, String(value));
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([size, value]) => {
    root.style.setProperty(`--spacing-${size}`, value);
  });

  // Border Radius
  Object.entries(theme.borderRadius).forEach(([size, value]) => {
    root.style.setProperty(`--border-radius-${size}`, value);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([size, value]) => {
    root.style.setProperty(`--shadow-${size}`, value);
  });

  // Transitions
  Object.entries(theme.transitions).forEach(([speed, value]) => {
    root.style.setProperty(`--transition-${speed}`, value);
  });
};

/**
 * Theme hook
 */
export const useTheme = (): {
  theme: AlsaniaTheme;
  setTheme: (theme: 'light' | 'dark') => void;
  isDark: boolean;
} => {
  const [isDark, setIsDark] = React.useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
  );

  React.useEffect(() => {
    const theme = isDark ? darkTheme : lightTheme;
    applyTheme(theme);
  }, [isDark]);

  return {
    theme: isDark ? darkTheme : lightTheme,
    setTheme: (mode: 'light' | 'dark') => setIsDark(mode === 'dark'),
    isDark,
  };
};
