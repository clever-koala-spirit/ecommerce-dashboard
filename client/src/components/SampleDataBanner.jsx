import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Link, CheckCircle } from 'lucide-react';
import { useShopify } from '../providers/ShopifyProvider';
import { useAuth } from '../providers/AuthProvider';

const PLATFORMS = [
  { key: 'shopify', label: 'Shopify' },
  { key: 'google', label: 'Google Ads' },
  { key: 'meta', label: 'Meta' },
  { key: 'klaviyo', label: 'Klaviyo' },
  { key: 'ga4', label: 'GA4' },
  { key: 'tiktok', label: 'TikTok' },
];

export default function SampleDataBanner() {
  const navigate = useNavigate();
  const { shop } = useShopify();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [connections, setConnections] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('ss_sample_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    const checkConnections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('ss_token');
        const shopDomain = user?.shopDomain || shop?.shopifyDomain;
        const res = await fetch(`${apiUrl}/api/connections`, {
          headers: {
            ...(shopDomain && { 'X-Shop-Domain': shopDomain }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const result = {};
          for (const p of PLATFORMS) {
            if (p.key === 'shopify') {
              result[p.key] = data.shopify?.connected || !!shopDomain;
            } else {
              result[p.key] = !!data[p.key]?.connected;
            }
          }
          setConnections(result);
        } else {
          const result = {};
          for (const p of PLATFORMS) {
            result[p.key] = p.key === 'shopify' && !!user?.shopDomain;
          }
          setConnections(result);
        }
      } catch {
        const result = {};
        for (const p of PLATFORMS) {
          result[p.key] = p.key === 'shopify' && !!user?.shopDomain;
        }
        setConnections(result);
      }
    };
    checkConnections();
  }, [shop?.shopifyDomain, user?.shopDomain]);

  if (dismissed || connections === null) return null;

  const allConnected = PLATFORMS.every((p) => connections[p.key]);
  if (allConnected) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ss_sample_banner_dismissed', '1');
  };

  const hasAnyDisconnected = PLATFORMS.some((p) => !connections[p.key]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '10px',
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        marginBottom: '8px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
        {PLATFORMS.map((p) => (
          <span
            key={p.key}
            onClick={() => !connections[p.key] && navigate('/settings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              color: connections[p.key] ? '#22c55e' : 'var(--color-text-secondary)',
              cursor: connections[p.key] ? 'default' : 'pointer',
              opacity: connections[p.key] ? 1 : 0.7,
              whiteSpace: 'nowrap',
            }}
          >
            {p.label} {connections[p.key] ? '✓' : '✗'}
          </span>
        ))}
      </div>
      {hasAnyDisconnected && (
        <button
          onClick={() => navigate('/settings')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--color-accent, #6366f1)',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Link size={12} />
          Connect
        </button>
      )}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          flexShrink: 0,
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
