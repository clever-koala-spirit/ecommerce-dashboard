import { format, subDays, startOfYear, endOfYear, parseISO, isValid } from 'date-fns';

// Format value as USD currency
export const formatCurrency = (value, decimals = 2) => {
  if (value === null || value === undefined) return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Format value as integer with comma separators
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Format value as percentage
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0.0%';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.0%';
  return `${(num * 100).toFixed(decimals)}%`;
};

// Format value in compact notation (K for thousands, M for millions, B for billions)
export const formatCompact = (value) => {
  if (value === null || value === undefined) return '$0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';

  const absValue = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
};

// Format number in compact notation
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  const absValue = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`;
  }
  return `${sign}${absValue.toFixed(0)}`;
};

// Format date with various options
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

// Format date as short (MMM d)
export const formatDateShort = (date) => formatDate(date, 'MMM d');

// Format date as long (MMMM d, yyyy)
export const formatDateLong = (date) => formatDate(date, 'MMMM d, yyyy');

// Format date as ISO (yyyy-MM-dd)
export const formatDateISO = (date) => formatDate(date, 'yyyy-MM-dd');

// Format date with time (MMM d, yyyy h:mm a)
export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy h:mm a');

// Format delta (change from previous to current)
export const formatDelta = (current, previous) => {
  if (previous === null || previous === undefined || previous === 0) {
    return { value: 'N/A', positive: null };
  }

  const delta = current - previous;
  const deltaPercent = (delta / Math.abs(previous)) * 100;
  const positive = delta >= 0;
  const sign = positive ? '+' : '';

  return {
    value: `${sign}${deltaPercent.toFixed(1)}%`,
    positive,
    absoluteDelta: delta,
    deltaPercent,
  };
};

// Format delta as currency
export const formatDeltaCurrency = (current, previous) => {
  if (previous === null || previous === undefined || previous === 0) {
    return { value: 'N/A', positive: null };
  }

  const delta = current - previous;
  const deltaPercent = (delta / Math.abs(previous)) * 100;
  const positive = delta >= 0;
  const sign = positive ? '+' : '';

  return {
    value: `${sign}${formatCurrency(delta)}`,
    positive,
    percentChange: `${sign}${deltaPercent.toFixed(1)}%`,
    absoluteDelta: delta,
    deltaPercent,
  };
};

// Get date range for preset or custom range
export const getDateRange = (preset, customStart = null, customEnd = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);

  let startDate;

  switch (preset) {
    case 'today':
      startDate = new Date(today);
      break;
    case '7d':
      startDate = subDays(today, 7);
      break;
    case '14d':
      startDate = subDays(today, 14);
      break;
    case '30d':
      startDate = subDays(today, 30);
      break;
    case '90d':
      startDate = subDays(today, 90);
      break;
    case 'ytd':
      startDate = startOfYear(today);
      break;
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom range requires customStart and customEnd');
      }
      startDate =
        typeof customStart === 'string' ? parseISO(customStart) : customStart;
      return {
        start: startDate,
        end: typeof customEnd === 'string' ? parseISO(customEnd) : customEnd,
        preset: 'custom',
        label: `${formatDateShort(startDate)} - ${formatDateShort(customEnd)}`,
      };
    default:
      startDate = subDays(today, 30);
  }

  return {
    start: startDate,
    end: endDate,
    preset,
    label: getDateRangeLabel(preset),
  };
};

// Get human-readable label for date range preset
export const getDateRangeLabel = (preset) => {
  const labels = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '14d': 'Last 14 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    ytd: 'Year to Date',
    custom: 'Custom Range',
  };
  return labels[preset] || 'Unknown Range';
};

// Filter data array by date range
export const filterDataByDateRange = (data, dateRange) => {
  if (!Array.isArray(data) || !dateRange) return data;

  const { start, end } = dateRange;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  return data.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const itemTime = itemDate.getTime();
    return itemTime >= startTime && itemTime <= endTime;
  });
};

// Calculate key metrics from Shopify data
export const calculateMetrics = (shopifyData, dateRange) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalRefunds: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      newCustomers: 0,
      returningCustomers: 0,
      totalCogs: 0,
      totalShipping: 0,
      totalTransactionFees: 0,
    };
  }

  const filteredData = dateRange
    ? filterDataByDateRange(shopifyData, dateRange)
    : shopifyData;

  const metrics = filteredData.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + (item.revenue || 0),
      totalOrders: acc.totalOrders + (item.orders || 0),
      totalRefunds: acc.totalRefunds + (item.refunds || 0),
      totalRefundAmount: acc.totalRefundAmount + (item.refundAmount || 0),
      newCustomers: acc.newCustomers + (item.newCustomers || 0),
      returningCustomers:
        acc.returningCustomers + (item.returningCustomers || 0),
      totalCogs: acc.totalCogs + (item.cogs || 0),
      totalShipping: acc.totalShipping + (item.shipping || 0),
      totalTransactionFees: acc.totalTransactionFees + (item.transactionFees || 0),
    }),
    {
      totalRevenue: 0,
      totalOrders: 0,
      totalRefunds: 0,
      totalRefundAmount: 0,
      newCustomers: 0,
      returningCustomers: 0,
      totalCogs: 0,
      totalShipping: 0,
      totalTransactionFees: 0,
    }
  );

  return {
    ...metrics,
    averageOrderValue:
      metrics.totalOrders > 0
        ? metrics.totalRevenue / metrics.totalOrders
        : 0,
    refundRate:
      metrics.totalOrders > 0 ? metrics.totalRefunds / metrics.totalOrders : 0,
    totalNewCustomers: metrics.newCustomers,
    totalReturningCustomers: metrics.returningCustomers,
    customerCount: metrics.newCustomers + metrics.returningCustomers,
  };
};

// Calculate gross profit
export const calculateGrossProfit = (revenue, cogs, shipping, transactionFees) => {
  return revenue - cogs - transactionFees;
};

// Calculate net profit
export const calculateNetProfit = (
  revenue,
  cogs,
  shipping,
  transactionFees,
  otherCosts = 0
) => {
  return revenue - cogs - shipping - transactionFees - otherCosts;
};

// Calculate ROAS (Return on Ad Spend)
export const calculateROAS = (revenue, spend) => {
  if (spend === 0 || !spend) return 0;
  return revenue / spend;
};

// Calculate CPA (Cost Per Acquisition)
export const calculateCPA = (spend, conversions) => {
  if (conversions === 0 || !conversions) return 0;
  return spend / conversions;
};

// Calculate CTR (Click Through Rate)
export const calculateCTR = (clicks, impressions) => {
  if (impressions === 0 || !impressions) return 0;
  return (clicks / impressions) * 100;
};

// Calculate CPM (Cost Per Mille)
export const calculateCPM = (spend, impressions) => {
  if (impressions === 0 || !impressions) return 0;
  return (spend / impressions) * 1000;
};

// Calculate conversion rate
export const calculateConversionRate = (conversions, visits) => {
  if (visits === 0 || !visits) return 0;
  return (conversions / visits) * 100;
};

// Parse currency string to number
export const parseCurrency = (str) => {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return 0;
  const num = parseFloat(str.replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
};

// Format time duration (e.g., "2h 30m")
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

// Format large numbers with ordinal suffix (1st, 2nd, 3rd, etc.)
export const formatOrdinal = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

// Get previous period based on current date range
export const getPreviousPeriod = (dateRange) => {
  if (!dateRange) return null;

  const { start, end } = dateRange;
  const rangeDays = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );

  const prevEnd = subDays(new Date(start), 1);
  const prevStart = subDays(prevEnd, rangeDays);

  return {
    start: prevStart,
    end: prevEnd,
  };
};
