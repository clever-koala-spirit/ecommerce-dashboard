import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, X, SlidersHorizontal, Download, Search, Bell, Sun, Moon, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchSyncStatus } from '../../services/api';

export default function FilterBar() {
  const dateRange = useStore((s) => s.dateRange);
  const setDateRange = useStore((s) => s.setDateRange);
  const comparisonEnabled = useStore((s) => s.comparisonEnabled);
  const toggleComparison = useStore((s) => s.toggleComparison);
  const selectedChannels = useStore((s) => s.selectedChannels);
  const toggleChannel = useStore((s) => s.toggleChannel);
  const customerType = useStore((s) => s.customerType);
  const setCustomerType = useStore((s) => s.setCustomerType);
  const savedViews = useStore((s) => s.savedViews);
  const saveView = useStore((s) => s.saveView);
  const loadView = useStore((s) => s.loadView);
  const deleteView = useStore((s) => s.deleteView);
  const { user } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [viewName, setViewName] = useState('');
  const [iconRotating, setIconRotating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const fetchDashboardData = useStore((s) => s.fetchDashboardData);

  // Fetch sync status on mount and periodically
  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await fetchSyncStatus();
      if (status.platforms) {
        const times = Object.values(status.platforms).map(p => p.lastSync).filter(Boolean);
        if (times.length > 0) {
          const latest = times.sort().pop();
          setLastSyncTime(new Date(latest));
        }
      }
    };
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboardData(null, true); // pass refresh=true
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboardData]);

  const formatSyncTime = (date) => {
    if (!date) return null;
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: '7D', value: '7d' },
    { label: '14D', value: '14d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'Custom', value: 'custom' },
  ];

  const channels = [
    { name: 'shopify', label: 'Shopify', color: '#96bf48' },
    { name: 'meta', label: 'Meta', color: '#1877f2' },
    { name: 'google', label: 'Google', color: '#ea4335' },
    { name: 'klaviyo', label: 'Klaviyo', color: '#4d4d4d' },
    { name: 'ga4', label: 'GA4', color: '#f16428' },
  ];

  const handleDateRangeChange = (value) => {
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      setDateRange(value, null, null);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      setDateRange('custom', customStart, customEnd);
      setShowCustomDate(false);
    }
  };

  const handleSaveView = () => {
    if (viewName.trim()) {
      saveView(viewName);
      setViewName('');
    }
  };

  const handleToggleTheme = useCallback(() => {
    setIconRotating(true);
    toggleTheme();
    setTimeout(() => setIconRotating(false), 400);
  }, [toggleTheme]);

  const advancedFilterCount =
    (customerType !== 'all' ? 1 : 0) +
    (selectedChannels.length < channels.length ? 1 : 0);

  const btnBg = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
  const btnBgHover = theme === 'light' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)';
  const btnBorder = colors.border;

  return (
    <div
      className="sticky top-0 z-30 border-b"
      style={{ background: colors.bgCard, borderColor: colors.border, transition: 'background-color 0.3s ease, border-color 0.3s ease', backdropFilter: 'blur(20px) saturate(180%)' }}
    >
      {/* Main top bar */}
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Title */}
        <h1 className="text-xl font-bold mr-4 hidden sm:block" style={{ color: colors.text }}>Dashboard</h1>

        {/* Date Range Pills */}
        <div className="flex gap-1 flex-wrap">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: dateRange.preset === option.value ? colors.accent : btnBg,
                color: dateRange.preset === option.value ? '#fff' : colors.textSecondary,
                border: `1px solid ${dateRange.preset === option.value ? colors.accent : btnBorder}`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: colors.textSecondary, background: btnBg }}
            onMouseEnter={(e) => { e.currentTarget.style.background = btnBgHover; e.currentTarget.style.color = colors.text; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.transform = 'scale(1)'; }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <div className={`theme-toggle-icon ${iconRotating ? 'rotating' : ''}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </div>
          </button>

          {/* Comparison Toggle */}
          <button
            onClick={toggleComparison}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hidden sm:block"
            style={{
              background: comparisonEnabled ? 'rgba(99, 102, 241, 0.12)' : btnBg,
              color: comparisonEnabled ? colors.accentLight : colors.textSecondary,
              border: `1px solid ${comparisonEnabled ? '#4f46e5' : btnBorder}`,
            }}
          >
            vs Previous
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200"
            style={{
              background: showAdvanced || advancedFilterCount > 0 ? 'rgba(99, 102, 241, 0.12)' : btnBg,
              color: showAdvanced || advancedFilterCount > 0 ? colors.accentLight : colors.textSecondary,
              border: `1px solid ${showAdvanced || advancedFilterCount > 0 ? '#4f46e5' : btnBorder}`,
            }}
          >
            <SlidersHorizontal size={13} />
            Filter
            {advancedFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Sync Status & Refresh */}
          <div className="flex items-center gap-1.5 hidden sm:flex">
            {lastSyncTime && (
              <span className="text-[10px] font-medium" style={{ color: colors.textTertiary }}>
                Synced {formatSyncTime(lastSyncTime)}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: colors.textSecondary, background: btnBg }}
              onMouseEnter={(e) => { if (!isRefreshing) { e.currentTarget.style.background = btnBgHover; e.currentTarget.style.color = colors.text; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = colors.textSecondary; }}
              title="Refresh data from live APIs"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Export */}
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 hidden sm:flex"
            style={{
              background: btnBg,
              color: colors.textSecondary,
              border: `1px solid ${btnBorder}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = btnBgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; }}
          >
            <Download size={13} />
            Export
          </button>

          {/* Views */}
          <div className="relative">
            <button
              onClick={() => setShowViewsMenu(!showViewsMenu)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-200 hidden sm:flex"
              style={{
                background: btnBg,
                color: colors.textSecondary,
                border: `1px solid ${btnBorder}`,
              }}
            >
              Views <ChevronDown size={12} />
            </button>

            {showViewsMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border z-50"
                style={{ background: colors.bgCard, borderColor: colors.border, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              >
                <div className="p-3 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Save as..."
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg text-sm"
                      style={{ background: 'var(--color-bg-input)', color: colors.text, border: `1px solid ${colors.border}` }}
                    />
                    <button onClick={handleSaveView} className="px-2 py-1 rounded-lg text-sm font-medium bg-indigo-500 text-white">
                      Save
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {savedViews.length > 0 ? (
                    savedViews.map((view) => (
                      <div key={view.id} className="p-2 flex items-center justify-between group" style={{ ':hover': { background: btnBgHover } }}>
                        <button
                          onClick={() => { loadView(view.id); setShowViewsMenu(false); }}
                          className="flex-1 text-left text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {view.name}
                        </button>
                        <button onClick={() => deleteView(view.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-center" style={{ color: colors.textTertiary }}>No saved views</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg transition-all duration-200 hidden sm:block"
            style={{ color: colors.textTertiary }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.textTertiary; }}
          >
            <Bell size={18} />
          </button>

          {/* User avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="px-6 pb-3 flex flex-wrap items-center gap-3 pt-1 border-t" style={{ borderColor: colors.border }}>
          <span className="category-label">CUSTOMERS</span>
          <div className="flex gap-1">
            {[{ label: 'All', value: 'all' }, { label: 'New', value: 'new' }, { label: 'Returning', value: 'returning' }].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setCustomerType(value)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: customerType === value ? colors.accent : btnBg,
                  color: customerType === value ? '#fff' : colors.textSecondary,
                  border: `1px solid ${customerType === value ? colors.accent : btnBorder}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="category-label ml-4">CHANNELS</span>
          <div className="flex gap-1 flex-wrap">
            {channels.map((channel) => (
              <button
                key={channel.name}
                onClick={() => toggleChannel(channel.name)}
                className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                style={{
                  background: selectedChannels.includes(channel.name) ? btnBgHover : btnBg,
                  color: selectedChannels.includes(channel.name) ? colors.text : colors.textTertiary,
                  border: `1px solid ${selectedChannels.includes(channel.name) ? channel.color + '60' : btnBorder}`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: channel.color }} />
                {channel.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date */}
      {showCustomDate && (
        <div className="px-6 pb-3 flex items-center gap-2">
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--color-bg-input)', color: colors.text, border: `1px solid ${colors.border}` }} />
          <span style={{ color: colors.textTertiary }}>to</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--color-bg-input)', color: colors.text, border: `1px solid ${colors.border}` }} />
          <button onClick={handleApplyCustomDate} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500 text-white">Apply</button>
          <button onClick={() => setShowCustomDate(false)} className="px-3 py-1.5 rounded-lg text-sm" style={{ color: colors.textSecondary, border: `1px solid ${colors.border}` }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
