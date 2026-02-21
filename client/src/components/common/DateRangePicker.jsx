import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { getDateRange, formatDateShort, getDateRangeLabel } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

// Holiday period definitions
const HOLIDAY_PERIODS = {
  'black-friday-week-2024': {
    label: 'Black Friday Week 2024',
    start: new Date(2024, 10, 25), // Nov 25, 2024
    end: new Date(2024, 10, 29),   // Nov 29, 2024
    icon: '🛍️'
  },
  'cyber-monday-2024': {
    label: 'Cyber Monday 2024', 
    start: new Date(2024, 11, 2),  // Dec 2, 2024
    end: new Date(2024, 11, 2),    // Dec 2, 2024
    icon: '💻'
  },
  'christmas-season-2024': {
    label: 'Christmas Season 2024',
    start: new Date(2024, 11, 1),  // Dec 1, 2024
    end: new Date(2024, 11, 25),   // Dec 25, 2024
    icon: '🎄'
  },
  'black-friday-week-2023': {
    label: 'Black Friday Week 2023',
    start: new Date(2023, 10, 23), // Nov 23, 2023
    end: new Date(2023, 10, 27),   // Nov 27, 2023
    icon: '🛍️'
  },
  'cyber-monday-2023': {
    label: 'Cyber Monday 2023',
    start: new Date(2023, 10, 27), // Nov 27, 2023
    end: new Date(2023, 10, 27),   // Nov 27, 2023
    icon: '💻'
  },
  'christmas-season-2023': {
    label: 'Christmas Season 2023',
    start: new Date(2023, 11, 1),  // Dec 1, 2023
    end: new Date(2023, 11, 25),   // Dec 25, 2023
    icon: '🎄'
  }
};

// Quarter definitions
const QUARTERS = {
  'q1-2024': {
    label: 'Q1 2024',
    start: new Date(2024, 0, 1),   // Jan 1, 2024
    end: new Date(2024, 2, 31),    // Mar 31, 2024
    icon: '📊'
  },
  'q2-2024': {
    label: 'Q2 2024',
    start: new Date(2024, 3, 1),   // Apr 1, 2024
    end: new Date(2024, 5, 30),    // Jun 30, 2024
    icon: '📊'
  },
  'q3-2024': {
    label: 'Q3 2024',
    start: new Date(2024, 6, 1),   // Jul 1, 2024
    end: new Date(2024, 8, 30),    // Sep 30, 2024
    icon: '📊'
  },
  'q4-2024': {
    label: 'Q4 2024',
    start: new Date(2024, 9, 1),   // Oct 1, 2024
    end: new Date(2024, 11, 31),   // Dec 31, 2024
    icon: '📊'
  }
};

// Get start/end of week for a given date (week starts on Sunday)
const getWeekBounds = (date, startOfWeek = 0) => { // 0 = Sunday, 1 = Monday
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + startOfWeek;
  const sunday = new Date(d.setDate(diff));
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return { start: sunday, end: saturday };
};

// Get start/end of month for a given date
const getMonthBounds = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
};

// Dynamic preset options that calculate relative to today
const getDynamicPresets = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // This week / last week
  const thisWeek = getWeekBounds(today);
  const lastWeekDate = new Date(today);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeek = getWeekBounds(lastWeekDate);

  // This month / last month
  const thisMonth = getMonthBounds(today);
  const lastMonthDate = new Date(today);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = getMonthBounds(lastMonthDate);

  return {
    'this-week': {
      label: 'This Week',
      ...thisWeek,
      icon: '📅'
    },
    'last-week': {
      label: 'Last Week', 
      ...lastWeek,
      icon: '📅'
    },
    'this-month': {
      label: 'This Month',
      ...thisMonth,
      icon: '📆'
    },
    'last-month': {
      label: 'Last Month',
      ...lastMonth,
      icon: '📆'
    }
  };
};

const PRESET_GROUPS = [
  {
    title: 'Quick Ranges',
    presets: [
      { key: '7d', label: 'Last 7 Days', icon: '⚡' },
      { key: '30d', label: 'Last 30 Days', icon: '⚡' },
      { key: '90d', label: 'Last 90 Days', icon: '⚡' },
    ]
  },
  {
    title: 'Relative Periods',
    presets: [
      { key: 'this-week', label: 'This Week', icon: '📅', dynamic: true },
      { key: 'last-week', label: 'Last Week', icon: '📅', dynamic: true },
      { key: 'this-month', label: 'This Month', icon: '📆', dynamic: true },
      { key: 'last-month', label: 'Last Month', icon: '📆', dynamic: true },
    ]
  },
  {
    title: 'Quarters',
    presets: Object.entries(QUARTERS).map(([key, config]) => ({
      key,
      label: config.label,
      icon: config.icon,
      quarter: true
    }))
  },
  {
    title: 'Holiday Periods',
    presets: Object.entries(HOLIDAY_PERIODS).map(([key, config]) => ({
      key,
      label: config.label,
      icon: config.icon,
      holiday: true
    }))
  }
];

export default function DateRangePicker({ className = '', showLabel = true }) {
  const { colors, theme } = useTheme();
  const dateRange = useStore(s => s.dateRange);
  const setDateRange = useStore(s => s.setDateRange);
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentLabel = () => {
    if (dateRange.preset === 'custom') {
      if (dateRange.customStart && dateRange.customEnd) {
        return `${formatDateShort(dateRange.customStart)} - ${formatDateShort(dateRange.customEnd)}`;
      }
      return 'Custom Range';
    }

    // Check if it's a dynamic preset
    const dynamicPresets = getDynamicPresets();
    if (dynamicPresets[dateRange.preset]) {
      return dynamicPresets[dateRange.preset].label;
    }

    // Check if it's a quarter
    if (QUARTERS[dateRange.preset]) {
      return QUARTERS[dateRange.preset].label;
    }

    // Check if it's a holiday period
    if (HOLIDAY_PERIODS[dateRange.preset]) {
      return HOLIDAY_PERIODS[dateRange.preset].label;
    }

    return getDateRangeLabel(dateRange.preset);
  };

  const handlePresetSelect = (preset) => {
    const dynamicPresets = getDynamicPresets();
    
    if (dynamicPresets[preset]) {
      // Handle dynamic presets
      const config = dynamicPresets[preset];
      setDateRange('custom', config.start.toISOString().split('T')[0], config.end.toISOString().split('T')[0]);
    } else if (QUARTERS[preset]) {
      // Handle quarters
      const config = QUARTERS[preset];
      setDateRange('custom', config.start.toISOString().split('T')[0], config.end.toISOString().split('T')[0]);
    } else if (HOLIDAY_PERIODS[preset]) {
      // Handle holiday periods
      const config = HOLIDAY_PERIODS[preset];
      setDateRange('custom', config.start.toISOString().split('T')[0], config.end.toISOString().split('T')[0]);
    } else {
      // Handle standard presets
      setDateRange(preset);
    }
    
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setDateRange('custom', customStart, customEnd);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  const handleCustomRangeClick = () => {
    setShowCustom(true);
    // Pre-populate with current dates if available
    if (dateRange.customStart) {
      setCustomStart(dateRange.customStart);
    }
    if (dateRange.customEnd) {
      setCustomEnd(dateRange.customEnd);
    }
  };

  const isCurrentPreset = (preset) => {
    if (dateRange.preset === preset) return true;
    
    // Check if current range matches a dynamic preset
    if (dateRange.preset === 'custom' && dateRange.customStart && dateRange.customEnd) {
      const dynamicPresets = getDynamicPresets();
      const config = dynamicPresets[preset] || QUARTERS[preset] || HOLIDAY_PERIODS[preset];
      if (config) {
        const startMatch = dateRange.customStart === config.start.toISOString().split('T')[0];
        const endMatch = dateRange.customEnd === config.end.toISOString().split('T')[0];
        return startMatch && endMatch;
      }
    }
    
    return false;
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
          Date Range
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{ 
          background: colors.bgCard,
          border: `1px solid ${isOpen ? colors.accent : colors.border}`,
          color: colors.text,
          boxShadow: isOpen ? `0 0 0 3px ${colors.accent}20` : 'none'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📅</span>
          <span>{getCurrentLabel()}</span>
        </div>
        <span 
          className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: colors.textSecondary }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 z-50 w-full min-w-[320px] mt-2 rounded-2xl shadow-xl"
          style={{ 
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            maxHeight: '480px',
            overflowY: 'auto'
          }}
        >
          {!showCustom ? (
            <div className="p-4">
              {PRESET_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className={groupIndex > 0 ? 'mt-4' : ''}>
                  <h4 className="text-xs font-semibold mb-2 px-2" style={{ color: colors.textSecondary }}>
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.presets.map((preset) => {
                      const isActive = isCurrentPreset(preset.key);
                      return (
                        <button
                          key={preset.key}
                          onClick={() => handlePresetSelect(preset.key)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-150 hover:scale-[1.01]"
                          style={{ 
                            background: isActive 
                              ? `${colors.accent}15` 
                              : 'transparent',
                            color: isActive ? colors.accent : colors.text,
                            border: isActive ? `1px solid ${colors.accent}30` : '1px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = colors.theme === 'light' 
                                ? 'rgba(0,0,0,0.03)' 
                                : 'rgba(255,255,255,0.03)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span className="text-base">{preset.icon}</span>
                          <span className="font-medium">{preset.label}</span>
                          {isActive && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Custom Range Option */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
                <button
                  onClick={handleCustomRangeClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-150 hover:scale-[1.01]"
                  style={{ 
                    background: dateRange.preset === 'custom' && !isCurrentPreset('this-week') && !isCurrentPreset('last-week') && !isCurrentPreset('this-month') && !isCurrentPreset('last-month') && !Object.keys(QUARTERS).some(q => isCurrentPreset(q)) && !Object.keys(HOLIDAY_PERIODS).some(h => isCurrentPreset(h))
                      ? `${colors.accent}15` 
                      : 'transparent',
                    color: dateRange.preset === 'custom' ? colors.accent : colors.text
                  }}
                  onMouseEnter={(e) => {
                    if (dateRange.preset !== 'custom') {
                      e.currentTarget.style.background = colors.theme === 'light' 
                        ? 'rgba(0,0,0,0.03)' 
                        : 'rgba(255,255,255,0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (dateRange.preset !== 'custom') {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className="text-base">🗓️</span>
                  <span className="font-medium">Custom Range</span>
                  <span className="ml-auto text-xs" style={{ color: colors.textSecondary }}>→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Custom Date Range Form */
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setShowCustom(false)}
                  className="text-sm hover:scale-110 transition-transform"
                  style={{ color: colors.textSecondary }}
                >
                  ←
                </button>
                <h4 className="text-sm font-semibold" style={{ color: colors.text }}>
                  Custom Date Range
                </h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 focus:scale-[1.02]"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    min={customStart}
                    className="w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 focus:scale-[1.02]"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text
                    }}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowCustom(false);
                      setCustomStart('');
                      setCustomEnd('');
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      color: colors.textSecondary
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customStart || !customEnd}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: customStart && customEnd ? colors.accent : colors.border,
                      border: `1px solid ${colors.accent}`,
                      color: customStart && customEnd ? 'white' : colors.textSecondary
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}