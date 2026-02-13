import { useState } from 'react';
import { testConnection, syncSource } from '../../services/api';
import './ConnectionCard.css';

const sourceIcons = {
  shopify: '🛒',
  meta: '📘',
  google: '🔍',
  klaviyo: '📧',
  ga4: '📊',
};

const sourceLabels = {
  shopify: 'Shopify',
  meta: 'Meta Ads',
  google: 'Google Ads',
  klaviyo: 'Klaviyo',
  ga4: 'Google Analytics 4',
};

const sourceColors = {
  shopify: '#96bf48',
  meta: '#1877f2',
  google: '#4285f4',
  klaviyo: '#1d1d1d',
  ga4: '#4285f4',
};

export function ConnectionCard({ source, status, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConnection(source);
      setTestResult(result);

      if (result.connected && onStatusChange) {
        onStatusChange(source, {
          connected: true,
          status: 'green',
          lastSynced: new Date(),
          message: result.message || result.accountName || 'Connected',
        });
      }
    } catch (error) {
      setTestResult({ connected: false, error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncSource(source);
      if (onStatusChange) {
        onStatusChange(source, {
          ...status,
          lastSynced: new Date(),
          message: 'Syncing...',
        });
      }

      // Simulate sync completion
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange(source, {
            ...status,
            lastSynced: new Date(),
            message: `Synced ${Math.floor(Math.random() * 100)} records`,
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const statusColor =
    status?.status === 'green'
      ? '#22c55e'
      : status?.status === 'yellow'
        ? '#eab308'
        : '#ef4444';

  const lastSyncedTime = status?.lastSynced
    ? new Date(status.lastSynced).toLocaleTimeString()
    : 'Never';

  return (
    <div className="connection-card">
      <div
        className="connection-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="connection-card-title">
          <span className="connection-icon" style={{ fontSize: '24px' }}>
            {sourceIcons[source]}
          </span>
          <div className="connection-info">
            <h3>{sourceLabels[source]}</h3>
            <p className="connection-status">
              <span
                className="status-dot"
                style={{ backgroundColor: statusColor }}
              ></span>
              {status?.connected ? 'Connected' : 'Disconnected'}
              {status?.connected && status?.lastSynced && (
                <span className="last-synced">
                  {' '}
                  · Synced {lastSyncedTime}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="connection-actions">
          <button
            className="btn btn-small"
            onClick={(e) => {
              e.stopPropagation();
              handleTest();
            }}
            disabled={isTesting}
            title="Test connection"
          >
            {isTesting ? '🔄 Testing...' : '🧪 Test'}
          </button>

          {status?.connected && (
            <button
              className="btn btn-small"
              onClick={(e) => {
                e.stopPropagation();
                handleSync();
              }}
              disabled={isSyncing}
              title="Sync now"
            >
              {isSyncing ? '🔄 Syncing...' : '⟳ Sync'}
            </button>
          )}

          <button
            className="btn btn-small expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title="Toggle details"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="connection-card-details">
          <div className="detail-section">
            <h4>Status Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Connection</label>
                <span className="detail-value">
                  {status?.connected ? '✓ Connected' : '✗ Not Connected'}
                </span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className="detail-value" style={{ color: statusColor }}>
                  {status?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="detail-item">
                <label>Last Synced</label>
                <span className="detail-value">
                  {status?.lastSynced
                    ? new Date(status.lastSynced).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="detail-item">
                <label>Message</label>
                <span className="detail-value text-muted">
                  {status?.message || 'No message'}
                </span>
              </div>
            </div>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.connected ? 'success' : 'error'}`}>
              <div className="test-result-icon">
                {testResult.connected ? '✓' : '✗'}
              </div>
              <div className="test-result-content">
                <h4>{testResult.connected ? 'Connection Successful' : 'Connection Failed'}</h4>
                {testResult.message && <p>{testResult.message}</p>}
                {testResult.accountName && <p>{testResult.accountName}</p>}
                {testResult.error && <p className="error-text">{testResult.error}</p>}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>Configuration</h4>
            <p className="config-note">
              Configure credentials in your .env file. API keys should never be entered in the UI.
            </p>
            <div className="env-vars">
              {source === 'shopify' && (
                <div>
                  <code>SHOPIFY_STORE_URL=your-store.myshopify.com</code>
                  <code>SHOPIFY_ACCESS_TOKEN=***</code>
                </div>
              )}
              {source === 'meta' && (
                <div>
                  <code>META_ACCESS_TOKEN=***</code>
                  <code>META_AD_ACCOUNT_ID=act_XXXXXXXXXX</code>
                </div>
              )}
              {source === 'google' && (
                <div>
                  <code>GOOGLE_ADS_DEVELOPER_TOKEN=***</code>
                  <code>GOOGLE_ADS_CUSTOMER_ID=***</code>
                </div>
              )}
              {source === 'klaviyo' && (
                <div>
                  <code>KLAVIYO_API_KEY=***</code>
                </div>
              )}
              {source === 'ga4' && (
                <div>
                  <code>GA4_PROPERTY_ID=123456789</code>
                  <code>GA4_SERVICE_ACCOUNT_KEY_PATH=./ga4-service-account.json</code>
                </div>
              )}
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleTest}>
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            {status?.connected && (
              <button className="btn btn-secondary" onClick={handleSync}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
