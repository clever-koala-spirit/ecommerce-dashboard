import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const platforms = [
  { key: 'shopify', label: 'Shopify', dataKey: 'shopifyData' },
  { key: 'google', label: 'Google Ads', dataKey: 'googleData' },
  { key: 'meta', label: 'Meta Ads', dataKey: 'metaData' },
  { key: 'klaviyo', label: 'Klaviyo', dataKey: 'klaviyoData' },
  { key: 'ga4', label: 'GA4', dataKey: 'ga4Data' },
  { key: 'tiktok', label: 'TikTok', dataKey: 'tiktokData' },
];

export default function ConnectionStatusBar() {
  const store = useStore();

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2 rounded-lg text-xs"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {platforms.map((p) => {
        const data = store[p.dataKey];
        const connected = Array.isArray(data) && data.length > 0;
        return (
          <span key={p.key} className="flex items-center gap-1">
            {connected ? (
              <span style={{ color: 'var(--color-success, #22c55e)' }}>✓</span>
            ) : (
              <Link to="/settings" style={{ color: 'var(--color-error, #ef4444)' }}>✗</Link>
            )}
            <span style={{ color: connected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
              {p.label}
            </span>
            {p.key !== 'tiktok' && <span style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>|</span>}
          </span>
        );
      })}
    </div>
  );
}
