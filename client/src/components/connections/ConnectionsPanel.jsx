import { useEffect, useState, useCallback } from 'react';
import { fetchConnectionStatus, syncSource } from '../../services/api';
import { ConnectionCard } from './ConnectionCard';
import './ConnectionsPanel.css';

const SOURCES = ['shopify', 'meta', 'google', 'klaviyo', 'ga4'];

export function ConnectionsPanel() {
  const [connections, setConnections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchConnectionStatus();
      if (result.data) {
        setConnections(result.data);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStatusChange = (source, newStatus) => {
    setConnections((prev) => ({
      ...prev,
      [source]: newStatus,
    }));
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const syncPromises = SOURCES.map((source) => syncSource(source));
      await Promise.all(syncPromises);

      // Refresh status after syncing
      await fetchStatus();
    } catch (error) {
      console.error('Error syncing all sources:', error);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const connectedCount = SOURCES.filter((s) => connections[s]?.connected).length;
  const healthPercentage = (connectedCount / SOURCES.length) * 100;
  const healthColor =
    healthPercentage === 100
      ? '#22c55e'
      : healthPercentage >= 60
        ? '#eab308'
        : '#ef4444';

  return (
    <div className="connections-panel">
      <div className="connections-header">
        <div className="header-content">
          <h2>Data Connections</h2>
          <p className="header-subtitle">
            Manage your marketing platform integrations
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleSyncAll}
            disabled={isSyncingAll || connectedCount === 0}
            title={connectedCount === 0 ? 'No sources connected' : 'Sync all data'}
          >
            {isSyncingAll ? '🔄 Syncing...' : '⟳ Sync All'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={fetchStatus}
            disabled={isLoading}
            title="Refresh connection status"
          >
            {isLoading ? '🔄 Checking...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <div className="health-bar-section">
        <div className="health-bar-content">
          <div className="health-info">
            <span className="health-label">Connection Health</span>
            <span className="health-count">
              {connectedCount} of {SOURCES.length} connected
            </span>
          </div>
          <div className="health-bar-container">
            <div
              className="health-bar"
              style={{
                width: `${healthPercentage}%`,
                backgroundColor: healthColor,
              }}
            ></div>
          </div>
        </div>

        {lastChecked && (
          <div className="last-checked">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="connections-grid">
        {SOURCES.map((source) => (
          <ConnectionCard
            key={source}
            source={source}
            status={connections[source] || { connected: false, status: 'red' }}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <div className="connections-footer">
        <div className="footer-info">
          <h3>📋 Data Coverage</h3>
          <div className="coverage-grid">
            {SOURCES.map((source) => {
              const isConnected = connections[source]?.connected;
              const sourceLabels = {
                shopify: 'Shopify',
                meta: 'Meta Ads',
                google: 'Google Ads',
                klaviyo: 'Klaviyo',
                ga4: 'Google Analytics',
              };

              return (
                <div
                  key={source}
                  className={`coverage-item ${isConnected ? 'connected' : 'disconnected'}`}
                >
                  <span className="coverage-label">{sourceLabels[source]}</span>
                  <span className="coverage-status">
                    {isConnected ? '✓ Active' : '○ Offline'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="footer-help">
          <h3>🚀 Getting Started</h3>
          <ol>
            <li>
              Add your API credentials to the <code>.env</code> file
            </li>
            <li>Restart the server to load the credentials</li>
            <li>Click "Test" on each connection to verify</li>
            <li>Click "Sync Now" to pull in your data</li>
            <li>Data will automatically refresh every 30 minutes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
