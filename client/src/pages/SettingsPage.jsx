import React, { useState } from 'react';
import {
  Shield,
  Settings,
  Link,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  Database,
  Mail,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useShopify } from '../providers/ShopifyProvider';
import { useAuth } from '../providers/AuthProvider';
import { useStore } from '../store/useStore';
import CostManager from '../components/costs/CostManager';

const PLATFORMS = {
  shopify: {
    name: 'Shopify',
    emoji: '🛍️',
    useOAuth: true,
    oauthLabel: 'Connect Shopify Store',
    description: 'Orders, products, and customer data',
  },
  meta: {
    name: 'Meta Ads',
    emoji: '📘',
    useOAuth: true,
    oauthLabel: 'Connect with Meta',
    description: 'Facebook & Instagram ad campaigns',
  },
  google: {
    name: 'Google Ads',
    emoji: '🔍',
    useOAuth: true,
    oauthLabel: 'Connect with Google',
    description: 'Google search & display campaigns',
  },
  klaviyo: {
    name: 'Klaviyo',
    emoji: '💌',
    useOAuth: false,
    useApiKey: true,
    oauthLabel: 'Connect with API Key',
    description: 'Email & SMS marketing flows',
  },
  ga4: {
    name: 'Google Analytics 4',
    emoji: '📊',
    useOAuth: true,
    oauthLabel: 'Connect with Google',
    description: 'Website traffic & conversions',
  },
  tiktok: {
    name: 'TikTok Ads',
    emoji: '🎵',
    useOAuth: true,
    oauthLabel: 'Connect with TikTok',
    description: 'TikTok ad campaigns & analytics',
  }
};

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-opus', 'claude-sonnet', 'claude-haiku'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'mistral', 'neural-chat'] }
];

export default function SettingsPage() {
  const { shop } = useShopify();
  const { user } = useAuth();
  const store = useStore();

  // State for shop linking
  const [linkShopDomain, setLinkShopDomain] = useState('');
  const [linkShopError, setLinkShopError] = useState('');
  const [linkShopSuccess, setLinkShopSuccess] = useState('');
  const [linkingShop, setLinkingShop] = useState(false);
  const [shopifyOAuthMessage, setShopifyOAuthMessage] = useState('');

  // State for platform connections
  const [platformStatus, setPlatformStatus] = useState({
    shopify: false,
    meta: false,
    google: false,
    klaviyo: false,
    ga4: false,
    tiktok: false
  });
  const [platformAccountInfo, setPlatformAccountInfo] = useState({
    shopify: null,
    meta: null,
    google: null,
    klaviyo: null,
    ga4: null,
    tiktok: null
  });
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  // State for AI settings
  const [aiProvider, setAiProvider] = useState(store?.aiProvider || 'openai');
  const [aiModel, setAiModel] = useState(store?.aiModel || 'gpt-4');
  const [aiApiKey, setAiApiKey] = useState(store?.aiApiKey || '');
  const [showAiKey, setShowAiKey] = useState(false);

  // "Coming soon" modal state
  const [comingSoonPlatform, setComingSoonPlatform] = useState(null);

  // Klaviyo API key modal
  const [showKlaviyoModal, setShowKlaviyoModal] = useState(false);
  const [klaviyoApiKey, setKlaviyoApiKey] = useState('');
  const [klaviyoError, setKlaviyoError] = useState('');
  const [klaviyoConnecting, setKlaviyoConnecting] = useState(false);

  // Link user to Shopify shop
  const handleLinkShop = async () => {
    let domain = linkShopDomain.trim();
    if (!domain) {
      setLinkShopError('Please enter your Shopify store domain');
      return;
    }
    // Auto-add .myshopify.com if needed
    if (!domain.includes('.myshopify.com')) {
      domain = `${domain}.myshopify.com`;
    }
    setLinkingShop(true);
    setLinkShopError('');
    setLinkShopSuccess('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('ss_token');
      const res = await fetch(`${apiUrl}/api/auth/link-shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ shopDomain: domain }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update token
        localStorage.setItem('ss_token', data.token);
        setLinkShopSuccess(`Successfully linked to ${data.shop.name || domain}! Refreshing...`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setLinkShopError(data.error || 'Failed to link shop');
      }
    } catch (err) {
      setLinkShopError('Network error. Please try again.');
    } finally {
      setLinkingShop(false);
    }
  };

  // Initiate OAuth flow for a platform
  const initiateOAuthFlow = async (platformKey) => {
    try {
      setConnectingPlatform(platformKey);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const params = new URLSearchParams();
      if (shop?.shopifyDomain) params.set('shop', shop.shopifyDomain);

      if (platformKey === 'shopify') {
        const shopDomain = prompt('Enter your Shopify store domain (e.g., mystore.myshopify.com):');
        if (!shopDomain) {
          setConnectingPlatform(null);
          return;
        }
        // Open Shopify OAuth in a new tab to avoid iframe capture
        window.open(`https://api.slayseason.com/api/auth?shop=${encodeURIComponent(shopDomain)}&force=1`, '_blank');
        setShopifyOAuthMessage('Complete the authorization in the new tab. Once done, refresh this page.');
        setConnectingPlatform(null);
        return;
      }

      // For non-Shopify platforms, check if the backend has credentials configured
      const checkRes = await fetch(`${apiUrl}/api/oauth/${platformKey}/start`, { redirect: 'manual' });
      if (checkRes.status === 501 || checkRes.type === 'opaqueredirect') {
        // 501 means not configured; opaqueredirect means it works (redirect to OAuth provider)
        if (checkRes.type === 'opaqueredirect') {
          // Actually has credentials — do the real redirect
          window.location.href = `${apiUrl}/api/oauth/${platformKey}/start?${params.toString()}`;
          return;
        }
        // Not configured — show coming soon
        setComingSoonPlatform(platformKey);
        setConnectingPlatform(null);
        return;
      }

      // If we got here with a non-redirect response, try to read it
      if (checkRes.ok || checkRes.status >= 300) {
        window.location.href = `${apiUrl}/api/oauth/${platformKey}/start?${params.toString()}`;
      } else {
        const data = await checkRes.json().catch(() => ({}));
        if (data.configured === false) {
          setComingSoonPlatform(platformKey);
          setConnectingPlatform(null);
        } else {
          window.location.href = `${apiUrl}/api/oauth/${platformKey}/start?${params.toString()}`;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to initiate ${platformKey} OAuth:`, error);
      }
      // Network error or CORS — show coming soon as fallback for non-Shopify
      if (platformKey !== 'shopify') {
        setComingSoonPlatform(platformKey);
      }
      setConnectingPlatform(null);
    }
  };

  // Disconnect platform
  const disconnectPlatform = async (platformKey) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('ss_token');
      const response = await fetch(`${apiUrl}/api/oauth/${platformKey}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(shop?.shopifyDomain && { 'X-Shop-Domain': shop.shopifyDomain }),
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setPlatformStatus(prev => ({
          ...prev,
          [platformKey]: false
        }));
        setPlatformAccountInfo(prev => ({
          ...prev,
          [platformKey]: null
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to disconnect ${platformKey}:`, error);
      }
    }
  };

  // Connect Klaviyo with API key
  const connectKlaviyo = async () => {
    if (!klaviyoApiKey.trim()) {
      setKlaviyoError('Please enter your Klaviyo Private API Key');
      return;
    }
    setKlaviyoConnecting(true);
    setKlaviyoError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('ss_token');
      const response = await fetch(`${apiUrl}/api/oauth/klaviyo/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(shop?.shopifyDomain && { 'X-Shop-Domain': shop.shopifyDomain }),
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ apiKey: klaviyoApiKey.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPlatformStatus(prev => ({ ...prev, klaviyo: true }));
        setPlatformAccountInfo(prev => ({ ...prev, klaviyo: { account: data.accountName || 'Connected' } }));
        setShowKlaviyoModal(false);
        setKlaviyoApiKey('');
      } else {
        setKlaviyoError(data.error || 'Failed to connect');
      }
    } catch (error) {
      setKlaviyoError('Network error. Please try again.');
    } finally {
      setKlaviyoConnecting(false);
    }
  };

  // Check platform connection status on mount
  React.useEffect(() => {
    const checkConnections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const token = localStorage.getItem('ss_token');
        const response = await fetch(`${apiUrl}/api/connections`, {
          headers: {
            ...(shop?.shopifyDomain && { 'X-Shop-Domain': shop.shopifyDomain }),
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlatformStatus({
            shopify: data.shopify?.connected || !!shop?.shopifyDomain || false,
            meta: data.meta?.connected || false,
            google: data.google?.connected || false,
            klaviyo: data.klaviyo?.connected || false,
            ga4: data.ga4?.connected || false,
            tiktok: data.tiktok?.connected || false,
          });
          setPlatformAccountInfo({
            shopify: shop?.shopifyDomain ? { account: shop.shopName || shop.shopifyDomain } : (data.shopify?.message ? { account: data.shopify.message } : null),
            meta: data.meta?.message ? { account: data.meta.message } : null,
            google: data.google?.message ? { account: data.google.message } : null,
            klaviyo: data.klaviyo?.message ? { account: data.klaviyo.message } : null,
            ga4: data.ga4?.message ? { account: data.ga4.message } : null,
            tiktok: data.tiktok?.message ? { account: data.tiktok.message } : null,
          });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to check platform connections:', error);
        }
        // Still set Shopify as connected if we have shop data
        if (shop?.shopifyDomain) {
          setPlatformStatus(prev => ({ ...prev, shopify: true }));
          setPlatformAccountInfo(prev => ({ ...prev, shopify: { account: shop.shopName || shop.shopifyDomain } }));
        }
      }
    };

    checkConnections();
  }, [shop?.shopifyDomain]);

  // Check for OAuth callback params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    const connected = params.get('connected');
    const error = params.get('error');

    if (platform && connected === 'true') {
      setPlatformStatus(prev => ({
        ...prev,
        [platform]: true
      }));
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (platform && error) {
      if (import.meta.env.DEV) {
        console.error(`OAuth error for ${platform}:`, error);
      }
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Update AI settings
  const handleAiProviderChange = (provider) => {
    setAiProvider(provider);
    const defaultModel = AI_PROVIDERS.find(p => p.id === provider)?.models[0] || '';
    setAiModel(defaultModel);
    store?.updateAiSettings?.({ provider, model: defaultModel });
  };

  const handleAiModelChange = (model) => {
    setAiModel(model);
    store?.updateAiSettings?.({ provider: aiProvider, model });
  };

  const handleAiApiKeyChange = (key) => {
    setAiApiKey(key);
    store?.updateAiSettings?.({ apiKey: key });
  };

  const currentAiProvider = AI_PROVIDERS.find(p => p.id === aiProvider);
  const isShopifyConnected = !!shop?.shopifyDomain;
  const isUserLoggedIn = !!user;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your dashboard, integrations, and preferences</p>
      </div>

      <div style={styles.settingsContainer}>
        {/* Store Info Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <BarChart3 size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Store Information</h2>
              <p style={styles.sectionDescription}>Your connected Shopify store details</p>
            </div>
          </div>

          <div className="glass-card" style={styles.card}>
            {isShopifyConnected ? (
              <div style={styles.storeInfo}>
                <div style={styles.storeInfoRow}>
                  <span style={styles.storeInfoLabel}>Store Name</span>
                  <span style={styles.storeInfoValue}>{shop?.shopName || 'N/A'}</span>
                </div>
                <div style={styles.storeInfoRow}>
                  <span style={styles.storeInfoLabel}>Domain</span>
                  <span style={styles.storeInfoValue}>{shop?.shopifyDomain || 'N/A'}</span>
                </div>
                <div style={styles.storeInfoRow}>
                  <span style={styles.storeInfoLabel}>Plan</span>
                  <span style={styles.storeInfoValue}>{shop?.plan || 'N/A'}</span>
                </div>
                <div style={styles.storeInfoRow}>
                  <span style={styles.storeInfoLabel}>Status</span>
                  <div style={styles.statusBadgeConnected}>
                    <CheckCircle size={16} />
                    Connected
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={32} style={{ color: '#6366f1' }} />
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Link your Shopify store</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                      Enter your .myshopify.com domain to connect your store data to this account.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={linkShopDomain}
                    onChange={(e) => setLinkShopDomain(e.target.value)}
                    placeholder="mystore.myshopify.com"
                    onKeyDown={(e) => e.key === 'Enter' && handleLinkShop()}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-input, #0f0f1a)',
                      color: 'var(--color-text-primary)',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={handleLinkShop}
                    disabled={linkingShop}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--color-accent, #6366f1)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: linkingShop ? 'wait' : 'pointer',
                      opacity: linkingShop ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {linkingShop ? 'Linking...' : 'Link Store'}
                  </button>
                </div>
                {linkShopError && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{linkShopError}</p>}
                {linkShopSuccess && <p style={{ color: '#22c55e', fontSize: '13px', margin: 0 }}>{linkShopSuccess}</p>}
              </div>
            )}
          </div>
        </section>

        {/* Platform Connections Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Link size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Platform Connections</h2>
              <p style={styles.sectionDescription}>Connect your marketing and analytics platforms</p>
            </div>
          </div>

          <div style={styles.platformsGrid}>
            {Object.entries(PLATFORMS).map(([platformKey, platform]) => {
              const isConnected = platformStatus[platformKey];
              const isConnecting = connectingPlatform === platformKey;
              const accountInfo = platformAccountInfo[platformKey];

              return (
                <div key={platformKey} className="glass-card" style={styles.platformCard}>
                  <div style={styles.platformHeader}>
                    <div style={styles.platformTitle}>
                      <span style={styles.platformEmoji}>{platform.emoji}</span>
                      <div>
                        <h3 style={styles.platformName}>{platform.name}</h3>
                        {platform.description && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 4px 0' }}>{platform.description}</p>}
                        <div style={isConnected ? styles.statusBadgeConnected : styles.statusBadgeDisconnected}>
                          {isConnected ? (
                            <>
                              <CheckCircle size={14} />
                              Connected
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Not Connected
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.platformBody}>
                    {isConnected && accountInfo ? (
                      <div style={styles.accountInfoBox}>
                        <div style={styles.accountInfoItem}>
                          <span style={styles.accountInfoLabel}>Account</span>
                          <span style={styles.accountInfoValue}>{accountInfo.account || 'Connected'}</span>
                        </div>
                      </div>
                    ) : null}

                    <div style={styles.platformActions}>
                      {!isConnected ? (
                        <button
                          style={styles.btnOAuth}
                          onClick={() => {
                            if (platform.useApiKey) {
                              setShowKlaviyoModal(true);
                            } else {
                              initiateOAuthFlow(platformKey);
                            }
                          }}
                          disabled={isConnecting}
                        >
                          <Link size={16} />
                          {isConnecting ? 'Connecting...' : platform.oauthLabel}
                        </button>
                      ) : (
                        <button
                          style={styles.btnDanger}
                          onClick={() => disconnectPlatform(platformKey)}
                          title="Disconnect this platform"
                        >
                          <Trash2 size={16} />
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {shopifyOAuthMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: '#c7d2fe' }}>{shopifyOAuthMessage}</span>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--color-accent, #6366f1)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginLeft: 'auto',
                }}
              >
                Refresh
              </button>
            </div>
          )}
        </section>

        {/* AI Assistant Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Zap size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>AI Assistant</h2>
              <p style={styles.sectionDescription}>Configure your AI provider and model</p>
            </div>
          </div>

          <div className="glass-card" style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>AI Provider</label>
              <div style={styles.radioGroup}>
                {AI_PROVIDERS.map(provider => (
                  <label key={provider.id} style={styles.radioOption}>
                    <input
                      type="radio"
                      name="ai-provider"
                      value={provider.id}
                      checked={aiProvider === provider.id}
                      onChange={(e) => handleAiProviderChange(e.target.value)}
                      style={styles.radioInput}
                    />
                    <span style={styles.radioLabel}>{provider.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {currentAiProvider && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="ai-model">Model</label>
                <select
                  id="ai-model"
                  value={aiModel}
                  onChange={(e) => handleAiModelChange(e.target.value)}
                  style={styles.formSelect}
                >
                  {currentAiProvider.models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="ai-api-key">API Key</label>
              <div style={styles.inputWrapper}>
                <input
                  id="ai-api-key"
                  type={showAiKey ? 'text' : 'password'}
                  value={aiApiKey}
                  onChange={(e) => handleAiApiKeyChange(e.target.value)}
                  placeholder="Enter your API key"
                  style={styles.formInput}
                />
                <button
                  style={styles.visibilityToggle}
                  onClick={() => setShowAiKey(!showAiKey)}
                  title={showAiKey ? 'Hide' : 'Show'}
                >
                  {showAiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Management Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Database size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Cost Management</h2>
              <p style={styles.sectionDescription}>Track and manage your integration costs</p>
            </div>
          </div>

          <CostManager />
        </section>

        {/* Export & Data Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Mail size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Export & Data</h2>
              <p style={styles.sectionDescription}>Export your analytics data</p>
            </div>
          </div>

          <div className="glass-card" style={styles.card}>
            <div style={styles.exportButtons}>
              <button style={styles.btnSecondary}>
                <Database size={18} />
                Export as CSV
              </button>
              <button style={styles.btnSecondary}>
                <Database size={18} />
                Export as JSON
              </button>
              <button style={styles.btnSecondary}>
                <Mail size={18} />
                Email Report
              </button>
            </div>
          </div>
        </section>

        {/* Account & Billing Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Shield size={24} style={styles.sectionIcon} />
            <div>
              <h2 style={styles.sectionTitle}>Account & Billing</h2>
              <p style={styles.sectionDescription}>Manage your subscription</p>
            </div>
          </div>

          <div className="glass-card" style={styles.card}>
            <div style={styles.billingInfo}>
              <div style={styles.planCard}>
                <h3 style={styles.planName}>Current Plan</h3>
                <p style={styles.planTitle}>Free Plan</p>
                <p style={styles.planDescription}>
                  Get started with basic analytics and 1 platform connection
                </p>
                <button style={styles.btnPrimaryLarge}>
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* Coming Soon Modal */}
      {comingSoonPlatform && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setComingSoonPlatform(null)}
        >
          <div
            style={{
              background: 'var(--color-bg-card, #1e1e2e)',
              border: '1px solid var(--color-border, #333)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {PLATFORMS[comingSoonPlatform]?.emoji || '🔗'}
            </div>
            <h3 style={{ color: 'var(--color-text-primary, #fff)', fontSize: '20px', margin: '0 0 8px' }}>
              {PLATFORMS[comingSoonPlatform]?.name} — Coming Soon
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              We're working on adding {PLATFORMS[comingSoonPlatform]?.name} integration.
              This will be available in an upcoming update.
            </p>
            <button
              onClick={() => setComingSoonPlatform(null)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-accent, #6366f1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* Klaviyo API Key Modal */}
      {showKlaviyoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => { setShowKlaviyoModal(false); setKlaviyoError(''); }}
        >
          <div
            style={{
              background: 'var(--color-bg-card, #1e1e2e)',
              border: '1px solid var(--color-border, #333)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '460px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>💌</div>
            <h3 style={{ color: 'var(--color-text-primary, #fff)', fontSize: '20px', margin: '0 0 8px', textAlign: 'center' }}>
              Connect Klaviyo
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px', textAlign: 'center' }}>
              Enter your Klaviyo Private API Key. You can find it in Klaviyo → Settings → API Keys.
            </p>
            <input
              type="password"
              value={klaviyoApiKey}
              onChange={(e) => setKlaviyoApiKey(e.target.value)}
              placeholder="pk_xxxxxxxxxxxxxxxxxxxx"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #333)',
                background: 'var(--color-bg-input, #0f0f1a)',
                color: 'var(--color-text-primary, #fff)',
                fontSize: '14px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
              onKeyDown={(e) => e.key === 'Enter' && connectKlaviyo()}
            />
            {klaviyoError && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px' }}>
                {klaviyoError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowKlaviyoModal(false); setKlaviyoError(''); }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #333)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={connectKlaviyo}
                disabled={klaviyoConnecting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--color-accent, #6366f1)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: klaviyoConnecting ? 'wait' : 'pointer',
                  opacity: klaviyoConnecting ? 0.7 : 1,
                }}
              >
                {klaviyoConnecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    background: 'var(--color-bg-page)',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--color-text-secondary)',
    margin: 0
  },
  settingsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  sectionIcon: {
    color: 'var(--color-accent)',
    marginTop: '4px',
    flexShrink: 0
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0'
  },
  sectionDescription: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    margin: 0
  },
  card: {
    padding: '24px',
    borderRadius: '12px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)'
  },
  storeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  storeInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--color-border)'
  },
  storeInfoLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)'
  },
  storeInfoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-primary)'
  },
  statusBadgeConnected: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusBadgeDisconnected: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    background: 'rgba(107, 114, 128, 0.1)',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 24px',
    textAlign: 'center',
    color: 'var(--color-text-secondary)'
  },
  emptyStateIcon: {
    color: 'var(--color-text-muted)'
  },
  platformsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  },
  platformCard: {
    padding: '0',
    borderRadius: '12px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  },
  platformHeader: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid var(--color-border)',
    transition: 'background-color 0.2s'
  },
  platformTitle: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  platformEmoji: {
    fontSize: '24px'
  },
  platformName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0'
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s'
  },
  platformBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  accountInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(34, 197, 94, 0.05)',
    border: '1px solid rgba(34, 197, 94, 0.2)'
  },
  accountInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  accountInfoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase'
  },
  accountInfoValue: {
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    fontWeight: '500'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-primary)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-input)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  formSelect: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-input)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  visibilityToggle: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  platformActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  btnSecondary: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnDanger: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    background: 'rgba(239, 68, 68, 0.05)',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnOAuth: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
  },
  radioGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  radioInput: {
    cursor: 'pointer',
    width: '18px',
    height: '18px'
  },
  radioLabel: {
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    cursor: 'pointer'
  },
  exportButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  billingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  planCard: {
    padding: '20px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  planName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    margin: '0 0 8px 0',
    textTransform: 'uppercase'
  },
  planTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px 0'
  },
  planDescription: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    margin: '0 0 16px 0'
  },
  btnPrimaryLarge: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--color-accent)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }
};
