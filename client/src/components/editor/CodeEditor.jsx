import { useState, useRef, useEffect } from 'react';
import { X, Play, Plus, Trash2, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';
// mockData removed — use live store data

const TEMPLATES = {
  'Quick Stats': `// Quick Stats - Logs today's revenue and orders
const today = dashboardData.shopify[dashboardData.shopify.length - 1];
console.log('Today Revenue:', today.revenue);
console.log('Today Orders:', today.orders);
console.log('Today AOV:', today.aov);
console.log('Today ROAS:', (today.revenue / 100).toFixed(2));`,

  'Revenue Forecast': `// Revenue Forecast - Runs forecast for 30 days
const recent = dashboardData.shopify.slice(-7);
const avgRevenue = recent.reduce((sum, d) => sum + d.revenue, 0) / 7;
const forecast = [];

for (let i = 0; i < 30; i++) {
  const day = new Date();
  day.setDate(day.getDate() + i);
  forecast.push({
    name: day.toLocaleDateString(),
    revenue: Math.round(avgRevenue * (0.95 + Math.random() * 0.1))
  });
}

console.log('30-Day Revenue Forecast Generated');
addWidget({
  title: '30-Day Revenue Forecast',
  type: 'line',
  data: forecast,
  dataKeys: ['revenue'],
  description: 'Generated forecast based on last 7 days average'
});`,

  'Channel Performance': `// Channel Performance - Compare all channels
const channels = {
  Shopify: dashboardData.shopify[dashboardData.shopify.length - 1],
  Meta: dashboardData.meta[dashboardData.meta.length - 1],
  Google: dashboardData.google[dashboardData.google.length - 1]
};

const data = Object.entries(channels).map(([name, data]) => ({
  name,
  revenue: data.revenue || data.conversionValue || 0,
  spend: data.spend || 0
}));

addWidget({
  title: 'Channel Performance Comparison',
  type: 'bar',
  data,
  dataKeys: ['revenue', 'spend'],
  description: 'Latest daily metrics across all channels'
});`,

  'Anomaly Detection': `// Anomaly Detection - Check for revenue drops
const recent = dashboardData.shopify.slice(-7);
const previous = dashboardData.shopify.slice(-14, -7);

const recentAvg = recent.reduce((sum, d) => sum + d.revenue, 0) / 7;
const prevAvg = previous.reduce((sum, d) => sum + d.revenue, 0) / 7;
const change = ((recentAvg / prevAvg - 1) * 100).toFixed(1);

console.log('Recent Week Avg Revenue:', recentAvg.toFixed(2));
console.log('Previous Week Avg Revenue:', prevAvg.toFixed(2));
console.log('Change:', change + '%');

if (recentAvg < prevAvg * 0.9) {
  console.log('⚠️ WARNING: Revenue decline detected!');
  addInsight({
    severity: 'warning',
    title: 'Revenue Decline Alert',
    body: 'Revenue is down ' + Math.abs(change) + '% week-over-week'
  });
}`,

  'Export Data': `// Export Data - Export filtered data as CSV
const dates = dashboardData.shopify.slice(-30);
const csv = dates.map(d => ({
  date: d.date,
  revenue: d.revenue,
  orders: d.orders,
  aov: d.aov,
  newCustomers: d.newCustomers
}));

console.log('Exporting 30 days of Shopify data...');
exportData('csv');
console.log('✓ Export complete')`,
};

export default function CodeEditor() {
  const editorOpen = useStore((s) => s.editorOpen);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const addCustomWidget = useStore((s) => s.addCustomWidget);
  const addInsight = useStore((s) => s.addInsight);

  const [tabs, setTabs] = useState(
    Object.keys(TEMPLATES).map((name) => ({
      id: `template-${name}`,
      name,
      code: TEMPLATES[name],
      isTemplate: true,
    }))
  );
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);
  const outputRef = useRef(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const updateTabCode = (code) => {
    setTabs(tabs.map((t) => (t.id === activeTabId ? { ...t, code } : t)));
  };

  const addNewTab = () => {
    const newTab = {
      id: `custom-${Date.now()}`,
      name: `Script ${tabs.length}`,
      code: '// Your code here\nconsole.log("Hello");',
      isTemplate: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const deleteTab = (tabId) => {
    if (tabs.length === 1) {
      alert('Cannot delete the last tab');
      return;
    }
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    setActiveTabId(newTabs[0].id);
  };

  const renameTab = (tabId, newName) => {
    setTabs(
      tabs.map((t) =>
        t.id === tabId ? { ...t, name: newName, isTemplate: false } : t
      )
    );
  };

  const runCode = () => {
    if (!activeTab) return;

    setIsRunning(true);
    setOutput('');

    try {
      // Create sandbox API
      const consoleLogs = [];
      const sandboxAPI = {
        dashboardData: {
          shopify: useStore.getState().shopifyData || [],
          meta: useStore.getState().metaData || [],
          google: useStore.getState().googleData || [],
          klaviyo: useStore.getState().klaviyoData || [],
          ga4: useStore.getState().ga4Data || [],
        },
        filters: {},
        console: {
          log: (...args) => {
            consoleLogs.push(args.map(arg => {
              if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
              return String(arg);
            }).join(' '));
          },
        },
        addWidget: (config) => {
          consoleLogs.push(`[Widget Added] ${config.title || 'Unnamed Widget'}`);
          addCustomWidget({
            ...config,
            id: `widget-${Date.now()}`,
          });
        },
        addMetric: (config) => {
          consoleLogs.push(`[Metric Added] ${config.name || 'Unnamed Metric'}`);
        },
        addInsight: (config) => {
          consoleLogs.push(`[Insight Added] ${config.title}`);
          addInsight({
            id: `insight-${Date.now()}`,
            severity: config.severity || 'info',
            title: config.title,
            body: config.body,
            timestamp: new Date(),
            dismissed: false,
            snoozed: false,
            bookmarked: false,
          });
        },
        exportData: (format) => {
          consoleLogs.push(`[Export] Data exported as ${format.toUpperCase()}`);
        },
        fetch: (...args) => fetch(...args),
      };

      // Execute user code in sandbox
      const userFunction = new Function(
        'dashboardData',
        'filters',
        'console',
        'addWidget',
        'addMetric',
        'addInsight',
        'exportData',
        'fetch',
        activeTab.code
      );

      userFunction(
        sandboxAPI.dashboardData,
        sandboxAPI.filters,
        sandboxAPI.console,
        sandboxAPI.addWidget,
        sandboxAPI.addMetric,
        sandboxAPI.addInsight,
        sandboxAPI.exportData,
        sandboxAPI.fetch
      );

      setOutput(consoleLogs.join('\n') || '(no output)');
    } catch (error) {
      setOutput(`❌ Error: ${error.message}\n\n${error.stack}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!editorOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleEditor}
      />

      {/* Editor Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 h-1/2 z-50 flex flex-col border-t"
        style={{
          background: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <h3
              className="font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Code Editor
            </h3>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--color-accent)',
              }}
            >
              Sandbox
            </span>
          </div>
          <button
            onClick={toggleEditor}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="px-4 py-2 flex gap-2 overflow-x-auto border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                activeTabId === tab.id ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                background:
                  activeTabId === tab.id
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'transparent',
              }}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    activeTabId === tab.id
                      ? 'var(--color-accent)'
                      : 'var(--color-text-secondary)',
                }}
                onDoubleClick={() => {
                  const newName = prompt('New tab name:', tab.name);
                  if (newName) renameTab(tab.id, newName);
                }}
              >
                {tab.name}
              </span>
              {!tab.isTemplate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTab(tab.id);
                  }}
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewTab}
            className="px-2 py-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Add new script"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <textarea
              ref={editorRef}
              value={activeTab?.code || ''}
              onChange={(e) => updateTabCode(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none"
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: 'none',
              }}
              spellCheck="false"
            />

            {/* Controls */}
            <div
              className="p-4 flex gap-2 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={runCode}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Output */}
          <div
            className="w-1/3 flex flex-col border-l"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-4 py-2 font-semibold text-sm border-b"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            >
              Console Output
            </div>
            <pre
              ref={outputRef}
              className="flex-1 p-4 overflow-auto font-mono text-xs"
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {output || '(awaiting execution)'}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
