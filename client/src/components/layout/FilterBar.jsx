import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../../store/useStore';

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

  // Count active advanced filters
  const advancedFilterCount =
    (customerType !== 'all' ? 1 : 0) +
    (selectedChannels.length < channels.length ? 1 : 0);

  return (
    <div
      className="sticky top-16 z-30 px-6 py-3 border-b"
      style={{
        background: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Primary row: Date range + comparison + advanced toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Selector */}
        <div className="flex gap-1">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
              className={`filter-chip ${
                dateRange.preset === option.value ? 'active' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Comparison Toggle */}
        <button
          onClick={toggleComparison}
          className={`filter-chip ${comparisonEnabled ? 'active' : ''}`}
        >
          vs Previous
        </button>

        {/* Advanced Filters Toggle */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`filter-chip flex items-center gap-1.5 ${showAdvanced || advancedFilterCount > 0 ? 'active' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {advancedFilterCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{ background: 'var(--color-accent)', color: 'white' }}
              >
                {advancedFilterCount}
              </span>
            )}
          </button>

          {/* Saved Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewsMenu(!showViewsMenu)}
              className="filter-chip flex items-center gap-1"
            >
              Views
              <ChevronDown size={14} />
            </button>

            {showViewsMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border"
                style={{
                  background: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Save as..."
                      value={viewName}
                      onChange={(e) => setViewName(e.target.value)}
                      className="flex-1 px-2 py-1 rounded text-sm"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <button
                      onClick={handleSaveView}
                      className="px-2 py-1 rounded text-sm font-medium"
                      style={{ background: 'var(--color-accent)', color: 'white' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {savedViews.length > 0 ? (
                    savedViews.map((view) => (
                      <div
                        key={view.id}
                        className="p-2 flex items-center justify-between group"
                      >
                        <button
                          onClick={() => {
                            loadView(view.id);
                            setShowViewsMenu(false);
                          }}
                          className="flex-1 text-left text-sm hover:text-accent transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {view.name}
                        </button>
                        <button
                          onClick={() => deleteView(view.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--color-red)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className="p-3 text-sm text-center"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      No saved views yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced filters (collapsible) */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {/* Customer Type */}
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Customers
          </span>
          <div className="flex gap-1">
            {[
              { label: 'All', value: 'all' },
              { label: 'New', value: 'new' },
              { label: 'Returning', value: 'returning' },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setCustomerType(value)}
                className={`filter-chip ${customerType === value ? 'active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Channel Filter */}
          <span className="text-xs font-medium uppercase tracking-wider ml-4" style={{ color: 'var(--color-text-muted)' }}>
            Channels
          </span>
          <div className="flex gap-1">
            {channels.map((channel) => (
              <button
                key={channel.name}
                onClick={() => toggleChannel(channel.name)}
                className={`filter-chip ${
                  selectedChannels.includes(channel.name) ? 'active' : ''
                }`}
                style={{
                  borderColor: selectedChannels.includes(channel.name)
                    ? channel.color
                    : 'var(--color-border)',
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ background: channel.color }}
                />
                {channel.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date Range Inputs */}
      {showCustomDate && (
        <div
          className="flex items-center gap-2 mt-3 p-3 rounded-lg border"
          style={{
            background: 'rgba(99, 102, 241, 0.05)',
            borderColor: 'var(--color-border)',
          }}
        >
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1 rounded text-sm"
            style={{
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          />
          <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1 rounded text-sm"
            style={{
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          />
          <button
            onClick={handleApplyCustomDate}
            className="px-3 py-1 rounded text-sm font-medium"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            Apply
          </button>
          <button
            onClick={() => setShowCustomDate(false)}
            className="px-3 py-1 rounded text-sm"
            style={{
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
