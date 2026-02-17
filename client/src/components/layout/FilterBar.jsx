import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal, Download, LayoutGrid, Search, Bell } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../providers/AuthProvider';

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

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showViewsMenu, setShowViewsMenu] = useState(false);
  const [viewName, setViewName] = useState('');

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

  const advancedFilterCount =
    (customerType !== 'all' ? 1 : 0) +
    (selectedChannels.length < channels.length ? 1 : 0);

  return (
    <div
      className="sticky top-0 z-30 border-b"
      style={{ background: '#0f1117', borderColor: '#1e2433' }}
    >
      {/* Main top bar */}
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Title */}
        <h1 className="text-xl font-bold text-white mr-4 hidden sm:block">Dashboard</h1>

        {/* Date Range Pills */}
        <div className="flex gap-1 flex-wrap">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: dateRange.preset === option.value ? '#6366f1' : 'rgba(255,255,255,0.05)',
                color: dateRange.preset === option.value ? '#fff' : '#9ca3af',
                border: `1px solid ${dateRange.preset === option.value ? '#6366f1' : '#2a2f3e'}`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Comparison Toggle */}
          <button
            onClick={toggleComparison}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hidden sm:block"
            style={{
              background: comparisonEnabled ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
              color: comparisonEnabled ? '#a5b4fc' : '#9ca3af',
              border: `1px solid ${comparisonEnabled ? '#4f46e5' : '#2a2f3e'}`,
            }}
          >
            vs Previous
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200"
            style={{
              background: showAdvanced || advancedFilterCount > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
              color: showAdvanced || advancedFilterCount > 0 ? '#a5b4fc' : '#9ca3af',
              border: `1px solid ${showAdvanced || advancedFilterCount > 0 ? '#4f46e5' : '#2a2f3e'}`,
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

          {/* Export */}
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 hidden sm:flex"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              border: '1px solid #2a2f3e',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
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
                background: 'rgba(255,255,255,0.05)',
                color: '#9ca3af',
                border: '1px solid #2a2f3e',
              }}
            >
              Views <ChevronDown size={12} />
            </button>

            {showViewsMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border z-50"
                style={{ background: '#151923', borderColor: '#2a2f3e', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              >
                <div className="p-3 border-b" style={{ borderColor: '#2a2f3e' }}>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Save as..."
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg text-sm"
                      style={{ background: '#0f1117', color: '#e5e7eb', border: '1px solid #2a2f3e' }}
                    />
                    <button onClick={handleSaveView} className="px-2 py-1 rounded-lg text-sm font-medium bg-indigo-500 text-white">
                      Save
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {savedViews.length > 0 ? (
                    savedViews.map((view) => (
                      <div key={view.id} className="p-2 flex items-center justify-between group hover:bg-white/5">
                        <button
                          onClick={() => { loadView(view.id); setShowViewsMenu(false); }}
                          className="flex-1 text-left text-sm"
                          style={{ color: '#9ca3af' }}
                        >
                          {view.name}
                        </button>
                        <button onClick={() => deleteView(view.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-center" style={{ color: '#6b7280' }}>No saved views</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg transition-all duration-200 hidden sm:block"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
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
        <div className="px-6 pb-3 flex flex-wrap items-center gap-3 pt-1 border-t" style={{ borderColor: '#1e2433' }}>
          <span className="text-[10px] font-semibold tracking-widest" style={{ color: '#6b7280' }}>CUSTOMERS</span>
          <div className="flex gap-1">
            {[{ label: 'All', value: 'all' }, { label: 'New', value: 'new' }, { label: 'Returning', value: 'returning' }].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setCustomerType(value)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: customerType === value ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  color: customerType === value ? '#fff' : '#9ca3af',
                  border: `1px solid ${customerType === value ? '#6366f1' : '#2a2f3e'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-[10px] font-semibold tracking-widest ml-4" style={{ color: '#6b7280' }}>CHANNELS</span>
          <div className="flex gap-1 flex-wrap">
            {channels.map((channel) => (
              <button
                key={channel.name}
                onClick={() => toggleChannel(channel.name)}
                className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                style={{
                  background: selectedChannels.includes(channel.name) ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  color: selectedChannels.includes(channel.name) ? '#e5e7eb' : '#6b7280',
                  border: `1px solid ${selectedChannels.includes(channel.name) ? channel.color + '60' : '#2a2f3e'}`,
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
            className="px-3 py-1.5 rounded-lg text-sm" style={{ background: '#151923', color: '#e5e7eb', border: '1px solid #2a2f3e' }} />
          <span style={{ color: '#6b7280' }}>to</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm" style={{ background: '#151923', color: '#e5e7eb', border: '1px solid #2a2f3e' }} />
          <button onClick={handleApplyCustomDate} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500 text-white">Apply</button>
          <button onClick={() => setShowCustomDate(false)} className="px-3 py-1.5 rounded-lg text-sm" style={{ color: '#9ca3af', border: '1px solid #2a2f3e' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
