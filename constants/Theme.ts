// Premium Design System - Inspired by Whoop, Aura, Eight Sleep
export const Theme = {
  // Core Colors
  colors: {
    // Backgrounds - Deep, rich blacks with subtle blue undertones
    background: {
      primary: '#050508',
      secondary: '#0A0A10',
      tertiary: '#101018',
      card: '#13131D',
      elevated: '#1A1A28',
    },
    
    // Accent - Electric cyan/teal (signature color)
    accent: {
      primary: '#00F5D4',
      secondary: '#00D4AA',
      tertiary: '#00B894',
      muted: 'rgba(0, 245, 212, 0.15)',
      subtle: 'rgba(0, 245, 212, 0.08)',
    },
    
    // Secondary accents
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      muted: 'rgba(139, 92, 246, 0.15)',
    },
    
    blue: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      muted: 'rgba(59, 130, 246, 0.15)',
    },
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Text
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1B5',
      tertiary: '#6B6B80',
      muted: '#4A4A5C',
    },
    
    // Borders
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.04)',
      accent: 'rgba(0, 245, 212, 0.3)',
    },
  },
  
  // Typography - Clean, modern hierarchy
  typography: {
    // Display - For hero numbers and key metrics
    display: {
      large: {
        fontSize: 56,
        fontWeight: '800' as const,
        letterSpacing: -2,
        lineHeight: 64,
      },
      medium: {
        fontSize: 44,
        fontWeight: '800' as const,
        letterSpacing: -1.5,
        lineHeight: 52,
      },
      small: {
        fontSize: 36,
        fontWeight: '700' as const,
        letterSpacing: -1,
        lineHeight: 44,
      },
    },
    
    // Headlines
    headline: {
      h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.5,
        lineHeight: 36,
      },
      h2: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
        lineHeight: 28,
      },
      h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        letterSpacing: -0.2,
        lineHeight: 24,
      },
    },
    
    // Body
    body: {
      large: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
      },
      medium: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
      },
      small: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
      },
    },
    
    // Labels
    label: {
      large: {
        fontSize: 14,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
      },
      medium: {
        fontSize: 12,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
      },
      small: {
        fontSize: 10,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
      },
    },
  },
  
  // Spacing - 4px base unit
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  
  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },
  
  // Shadows (for elevated elements)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#00F5D4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  // Gradients
  gradients: {
    primary: ['#00F5D4', '#00B894'],
    purple: ['#8B5CF6', '#6366F1'],
    dark: ['#13131D', '#050508'],
    card: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'],
    glow: ['rgba(0, 245, 212, 0.2)', 'rgba(0, 245, 212, 0)'],
  },
};

// Haptic patterns for different interactions
export const HapticPatterns = {
  light: 'light',
  medium: 'medium', 
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
  selection: 'selection',
} as const;

// Animation durations
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

export default Theme;
