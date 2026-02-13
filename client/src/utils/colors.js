// Dashboard color constants for consistent theming across all components

export const COLORS = {
  // Semantic colors for profit/loss
  GREEN: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  RED: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  BLUE: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  ORANGE: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  PURPLE: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  CYAN: {
    50: '#ecf0f1',
    100: '#cfe8e5',
    200: '#b5ddd9',
    300: '#9ad2cc',
    400: '#7fc7c0',
    500: '#64bcb4',
    600: '#4db1a8',
    700: '#36a69c',
    800: '#1f9b90',
    900: '#089084',
  },
  YELLOW: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  PINK: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f8b4d5',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  INDIGO: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
};

// Channel-specific colors for consistent data visualization
export const CHANNEL_COLORS = {
  shopify: COLORS.BLUE[500],
  shopifyLight: COLORS.BLUE[300],
  meta: '#1877F2', // Facebook blue
  metaLight: '#E7F3FF',
  google: '#EA4335', // Google red
  googleLight: '#FCE4DC',
  googleads: '#EA4335',
  googleadsLight: '#FCE4DC',
  klaviyo: '#2D2D2D', // Dark gray/black
  klaviyoLight: '#F5F5F5',
  organic: COLORS.GREEN[500],
  organicLight: COLORS.GREEN[200],
  direct: COLORS.PURPLE[500],
  directLight: COLORS.PURPLE[200],
  social: COLORS.PINK[500],
  socialLight: COLORS.PINK[200],
  referral: COLORS.ORANGE[500],
  referralLight: COLORS.ORANGE[200],
  email: COLORS.CYAN[500],
  emailLight: COLORS.CYAN[200],
  cpc: COLORS.INDIGO[500],
  cpcLight: COLORS.INDIGO[200],
};

// Color palette for multi-series charts and data visualization
export const CHART_COLORS = [
  COLORS.BLUE[500],
  COLORS.ORANGE[500],
  COLORS.GREEN[500],
  COLORS.RED[500],
  COLORS.PURPLE[500],
  COLORS.CYAN[500],
  COLORS.YELLOW[500],
  COLORS.PINK[500],
  COLORS.INDIGO[500],
  COLORS.BLUE[700],
  COLORS.ORANGE[700],
  COLORS.GREEN[700],
];

// Semantic colors for status indicators
export const STATUS_COLORS = {
  success: COLORS.GREEN[500],
  error: COLORS.RED[500],
  warning: COLORS.YELLOW[500],
  info: COLORS.BLUE[500],
  neutral: COLORS.GRAY[500],
  loading: COLORS.CYAN[500],
};

// Comparison delta colors
export const DELTA_COLORS = {
  positive: COLORS.GREEN[600],
  negative: COLORS.RED[600],
  neutral: COLORS.GRAY[500],
};

// Forecast visualization colors
export const FORECAST_COLORS = {
  actual: COLORS.BLUE[600],
  predicted: COLORS.PURPLE[500],
  bestCase: COLORS.GREEN[500],
  worstCase: COLORS.RED[500],
  confidence95: COLORS.PURPLE[200],
  confidence80: COLORS.PURPLE[300],
  confidence50: COLORS.PURPLE[400],
};

// Background colors for cards and containers
export const BG_COLORS = {
  light: COLORS.GRAY[50],
  dark: COLORS.GRAY[900],
  darkSecondary: COLORS.GRAY[800],
  success: COLORS.GREEN[50],
  error: COLORS.RED[50],
  warning: COLORS.YELLOW[50],
  info: COLORS.BLUE[50],
};

// Text colors
export const TEXT_COLORS = {
  primary: COLORS.GRAY[900],
  secondary: COLORS.GRAY[600],
  tertiary: COLORS.GRAY[500],
  muted: COLORS.GRAY[400],
  light: COLORS.GRAY[100],
  lightSecondary: COLORS.GRAY[50],
};

// Border colors
export const BORDER_COLORS = {
  light: COLORS.GRAY[200],
  default: COLORS.GRAY[300],
  dark: COLORS.GRAY[400],
  darker: COLORS.GRAY[600],
};

// Export color utility functions
export const getColorByMetric = (metric) => {
  const metricLower = metric.toLowerCase();
  if (
    metricLower.includes('revenue') ||
    metricLower.includes('sales') ||
    metricLower.includes('roas')
  ) {
    return COLORS.BLUE[500];
  }
  if (metricLower.includes('spend') || metricLower.includes('cost')) {
    return COLORS.ORANGE[500];
  }
  if (
    metricLower.includes('profit') ||
    metricLower.includes('growth') ||
    metricLower.includes('aov')
  ) {
    return COLORS.GREEN[500];
  }
  if (metricLower.includes('cpa') || metricLower.includes('cpc')) {
    return COLORS.RED[500];
  }
  return COLORS.GRAY[500];
};

export const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.neutral;
  const statusLower = status.toLowerCase();
  if (statusLower === 'green' || statusLower === 'healthy') {
    return COLORS.GREEN[500];
  }
  if (statusLower === 'yellow' || statusLower === 'warning') {
    return COLORS.YELLOW[500];
  }
  if (statusLower === 'red' || statusLower === 'error') {
    return COLORS.RED[500];
  }
  return STATUS_COLORS.neutral;
};

export const getDeltaColor = (isPositive) => {
  return isPositive ? DELTA_COLORS.positive : DELTA_COLORS.negative;
};

export const getChannelColor = (channel) => {
  const channelLower = channel.toLowerCase();
  return CHANNEL_COLORS[channelLower] || COLORS.GRAY[500];
};

export const getChannelLightColor = (channel) => {
  const channelLower = channel.toLowerCase();
  return CHANNEL_COLORS[`${channelLower}Light`] || COLORS.GRAY[200];
};
