import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Link } from 'lucide-react';
import { useShopify } from '../providers/ShopifyProvider';

export default function SampleDataBanner() {
  const navigate = useNavigate();
  const { shop } = useShopify();
  const [dismissed, setDismissed] = useState(false);
  const [hasConnections, setHasConnections] = useState(null);

  useEffect(() => {
    // Check if user dismissed this session
    if (sessionStorage.getItem('ss_sample_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    // Check for connected platforms
    const checkConnections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('ss_token');
        const res = await fetch(`${apiUrl}/api/connections`, {
          headers: {
            ...(shop?.shopifyDomain && { 'X-Shop-Domain': shop.shopifyDomain }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const connected = Object.values(data).some((p) => p?.connected);
          setHasConnections(connected || !!shop?.shopifyDomain);
        } else {
          setHasConnections(false);
        }
      } catch {
        setHasConnections(false);
      }
    };
    checkConnections();
  }, [shop?.shopifyDomain]);

  if (dismissed || hasConnections === null || hasConnections) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ss_sample_banner_dismissed', '1');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        marginBottom: '8px',
      }}
    >
      <AlertCircle size={20} style={{ color: '#818cf8', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '14px', color: '#c7d2fe' }}>
        You're viewing <strong>sample data</strong>. Connect your platforms to see your real analytics.
      </span>
      <button
        onClick={() => navigate('/settings')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--color-accent, #6366f1)',
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Link size={14} />
        Connect Platforms
      </button>
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
