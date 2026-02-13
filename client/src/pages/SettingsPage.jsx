import { useState } from 'react';
import { Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ConnectionsPanel } from '../components/connections/ConnectionsPanel';
import CostManager from '../components/costs/CostManager';

export default function SettingsPage() {
  const savedViews = useStore((s) => s.savedViews);
  const deleteView = useStore((s) => s.deleteView);

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const aiProviders = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
    {
      id: 'anthropic',
      name: 'Anthropic',
      models: ['claude-opus-4-6', 'claude-opus', 'claude-sonnet'],
    },
    { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'mistral', 'neural-chat'] },
  ];

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      const data = await response.json();
      setTestResult({ success: true, message: 'Configuration saved successfully' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey || !selectedProvider) {
      setTestResult({ success: false, message: 'Please enter API key and select provider' });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          apiKey,
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed: ' + error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Data Connections - Using new ConnectionsPanel */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Data Connections
        </h2>
        <ConnectionsPanel />
      </section>

      {/* AI Assistant Settings */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          AI Assistant
        </h2>
        <div className="glass-card p-6 space-y-6 max-w-2xl">
          {/* Provider Selection */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              AI Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {aiProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                    selectedProvider === provider.id ? 'ring-2' : ''
                  }`}
                  style={{
                    background:
                      selectedProvider === provider.id
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'var(--color-bg-card)',
                    borderColor:
                      selectedProvider === provider.id
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                    color:
                      selectedProvider === provider.id
                        ? 'var(--color-accent)'
                        : 'var(--color-text-primary)',
                  }}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {aiProviders
                .find((p) => p.id === selectedProvider)
                ?.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${selectedProvider} API key...`}
                className="w-full px-4 py-2 pr-10 rounded-lg border text-sm"
                style={{
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Your API key is encrypted and never shared
            </p>
          </div>

          {/* Rate Limit */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Rate Limit (requests per minute)
            </label>
            <input
              type="number"
              defaultValue="60"
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className="p-3 rounded-lg flex items-center gap-2 text-sm"
              style={{
                background: testResult.success
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: testResult.success ? '#22c55e' : '#ef4444',
                border: `1px solid ${testResult.success ? '#22c55e' : '#ef4444'}`,
              }}
            >
              {testResult.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
              }}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-accent)',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </section>

      {/* Cost Management */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Cost Management
        </h2>
        <CostManager />
      </section>

      {/* Saved Views */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Saved Views
        </h2>
        {savedViews.length > 0 ? (
          <div className="space-y-2">
            {savedViews.map((view) => (
              <div
                key={view.id}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {view.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Created {new Date(view.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteView(view.id)}
                  className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-red)',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="glass-card p-6 text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <p>No saved views yet. Create one from the dashboard filters.</p>
          </div>
        )}
      </section>

      {/* Export & Data */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Export & Data
        </h2>
        <div className="glass-card p-6 space-y-3">
          <button
            className="w-full px-4 py-3 rounded-lg font-medium text-left hover:bg-opacity-50 transition-colors"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            Export All Data (CSV)
          </button>
          <button
            className="w-full px-4 py-3 rounded-lg font-medium text-left hover:bg-opacity-50 transition-colors"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            Export Current View
          </button>
          <button
            className="w-full px-4 py-3 rounded-lg font-medium text-left hover:bg-opacity-50 transition-colors"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            Download Report (PDF)
          </button>
        </div>
      </section>
    </div>
  );
}
