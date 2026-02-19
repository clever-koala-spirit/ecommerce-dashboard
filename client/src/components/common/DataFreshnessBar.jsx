import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../store/useStore';
import AutoRefreshTimer from './AutoRefreshTimer';

const platforms = [
  { key: 'shopify', label: 'Shopify', color: '#96bf48', icon: '🛍️' },
  { key: 'meta', label: 'Meta', color: '#1877f2', icon: '📘' },
  { key: 'google', label: 'Google', color: '#ea4335', icon: '🔍' },
  { key: 'klaviyo', label: 'Klaviyo', color: '#2D2D2D', icon: '📧' },
  { key: 'ga4', label: 'GA4', color: '#f16428', icon: '📊' },
];

function formatTimeAgo(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PlatformBadge({ platform, isConnected, lastSynced, isLoading, error, colors, theme }) {
  const timeAgo = formatTimeAgo(lastSynced);
  const isFresh = lastSynced && (Date.now() - new Date(lastSynced).getTime()) < 600000; // < 10 min

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 group relative"
      style={{
        background: isLoading ? `${platform.color}08` : isConnected ? (theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)') : 'transparent',
        border: `1px solid ${isConnected ? `${platform.color}20` : colors.border}`,
        opacity: isConnected ? 1 : 0.5,
      }}
    >
      {/* Status dot */}
      <div className="relative">
        <div
          className="w-2 h-2 rounded-full transition-colors duration-300"
          style={{
            background: isLoading ? colors.accent : error ? '#ef4444' : isConnected ? (isFresh ? '#22c55e' : '#f59e0b') : colors.textTertiary,
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: colors.accent, opacity: 0.5 }} />
        )}
      </div>

      {/* Label */}
      <span className="text-[11px] font-medium" style={{ color: isConnected ? colors.text : colors.textTertiary }}>
        {platform.label}
      </span>

      {/* Time */}
      {isConnected && timeAgo && (
        <span className="text-[9px] font-medium" style={{ color: isFresh ? '#22c55e' : '#f59e0b' }}>
          {timeAgo}
        </span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <p className="text-[11px] font-semibold" style={{ color: colors.text }}>{platform.label}</p>
        <p className="text-[10px]" style={{ color: colors.textSecondary }}>
          {error ? `Error: ${error}` : isConnected ? (isLoading ? 'Syncing...' : `Last synced: ${timeAgo || 'Unknown'}`) : 'Not connected'}
        </p>
        {isConnected && !error && (
          <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: isFresh ? '#22c55e' : '#f59e0b' }}>
            {isFresh ? <CheckCircle size={9} /> : <Clock size={9} />}
            {isFresh ? 'Data is fresh' : 'Data may be stale'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DataFreshnessBar() {
  const { colors, theme } = useTheme();
  const lastSynced = useStore(s => s.lastSynced);
  const isLoading = useStore(s => s.isLoading);
  const errors = useStore(s => s.errors);
  const isLive = useStore(s => s.isLive);
  const shopifyData = useStore(s => s.shopifyData);
  const metaData = useStore(s => s.metaData);
  const googleData = useStore(s => s.googleData);

  const connectionMap = {
    shopify: shopifyData?.length > 0,
    meta: metaData?.length > 0,
    google: googleData?.length > 0,
    klaviyo: false,
    ga4: false,
  };

  const connectedCount = Object.values(connectionMap).filter(Boolean).length;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl px-4 py-2.5"
      style={{ background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}` }}>
      
      {/* Left: Platform badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 mr-2">
          {isLive ? (
            <>
              <div className="relative">
                <Wifi size={12} style={{ color: '#22c55e' }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#22c55e' }}>Live</span>
            </>
          ) : (
            <>
              <WifiOff size={12} style={{ color: colors.textTertiary }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textTertiary }}>Sample</span>
            </>
          )}
        </div>

        <div className="w-px h-4" style={{ background: colors.border }} />

        {platforms.map(p => (
          <PlatformBadge
            key={p.key}
            platform={p}
            isConnected={connectionMap[p.key]}
            lastSynced={lastSynced?.[p.key]}
            isLoading={isLoading?.[p.key]}
            error={errors?.[p.key]}
            colors={colors}
            theme={theme}
          />
        ))}
      </div>

      {/* Right: Auto-refresh + security */}
      <div className="flex items-center gap-3">
        <AutoRefreshTimer />
        
        <div className="w-px h-4" style={{ background: colors.border }} />
        
        {/* Security badge */}
        <div className="flex items-center gap-1.5" title="Data encrypted in transit and at rest">
          <Shield size={12} style={{ color: '#22c55e' }} />
          <span className="text-[10px] font-medium" style={{ color: colors.textTertiary }}>
            Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
