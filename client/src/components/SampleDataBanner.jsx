import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, Link, CheckCircle } from 'lucide-react';
import { useShopify } from '../providers/ShopifyProvider';
import { useAuth } from '../providers/AuthProvider';

export default function SampleDataBanner() {
  const navigate = useNavigate();
  const { shop } = useShopify();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [connectionState, setConnectionState] = useState(null); // null | 'none' | 'shopify_only' | 'all'

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
          const shopifyConnected = data.shopify?.connected || !!shopDomain;
          const otherConnected = ['meta', 'google', 'klaviyo', 'ga4', 'tiktok'].some(
            (p) => data[p]?.connected
          );
          if (shopifyConnected && otherConnected) {
            setConnectionState('all');
          } else if (shopifyConnected) {
            setConnectionState('shopify_only');
          } else {
            setConnectionState('none');
          }
        } else {
          setConnectionState(user?.shopDomain ? 'shopify_only' : 'none');
        }
      } catch {
        setConnectionState(user?.shopDomain ? 'shopify_only' : 'none');
      }
    };
    checkConnections();
  }, [shop?.shopifyDomain, user?.shopDomain]);

  if (dismissed || connectionState === null || connectionState === 'all') return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ss_sample_banner_dismissed', '1');
  };

  if (connectionState === 'shopify_only') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          marginBottom: '8px',
        }}
      >
        <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '14px', color: '#bbf7d0' }}>
          <strong>Shopify connected!</strong> Connect more platforms for deeper insights.
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

  // connectionState === 'none'
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
        You're viewing <strong>sample data</strong>. Connect your Shopify store to see real data.
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
        Connect Shopify
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
