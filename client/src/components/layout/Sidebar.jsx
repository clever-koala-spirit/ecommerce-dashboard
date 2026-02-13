import { Bell, X, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export default function Sidebar() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const insights = useStore((s) => s.insights);
  const dismissInsight = useStore((s) => s.dismissInsight);
  const snoozeInsight = useStore((s) => s.snoozeInsight);
  const unreadCount = insights.filter((i) => !i.dismissed && !i.snoozed).length;

  const [snoozedInsightId, setSnoozedInsightId] = useState(null);

  const activeInsights = insights.filter(
    (i) => !i.dismissed && !i.snoozed
  );

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="text-lg">🚨</span>;
      case 'warning':
        return <span className="text-lg">⚠️</span>;
      case 'info':
        return <span className="text-lg">ℹ️</span>;
      default:
        return <span className="text-lg">💡</span>;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'insight-critical';
      case 'warning':
        return 'insight-warning';
      case 'info':
        return 'insight-info';
      default:
        return 'insight-info';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-80 transition-transform duration-300 border-l flex flex-col ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
          zIndex: 35,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Bell size={18} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
              AI Insights
            </h3>
            {unreadCount > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--color-red)',
                  color: 'white',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Insights List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeInsights.length > 0 ? (
            <div className="space-y-2">
              {activeInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`insight-card p-3 text-sm ${getSeverityClass(
                    insight.severity
                  )}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="mt-0.5">
                      {getSeverityIcon(insight.severity)}
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {insight.title}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {insight.body}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div
                    className="flex items-center gap-1 text-xs mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Clock size={12} />
                    <span>
                      {new Date(insight.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        snoozeInsight(insight.id);
                        setSnoozedInsightId(insight.id);
                        setTimeout(() => setSnoozedInsightId(null), 2000);
                      }}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {snoozedInsightId === insight.id ? 'Snoozed' : 'Snooze'}
                    </button>
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--color-red)',
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Bell size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No insights yet</p>
              <p className="text-xs mt-1 opacity-75">
                Insights will appear as data flows in
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed right-4 bottom-20 p-3 rounded-full transition-all hover:scale-110"
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            zIndex: 30,
          }}
          title="Open insights"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'var(--color-red)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  );
}
