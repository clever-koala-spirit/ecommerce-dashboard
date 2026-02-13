import { Link, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  Code,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';

export default function TopNav() {
  const location = useLocation();
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const editorOpen = useStore((s) => s.editorOpen);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const chatOpen = useStore((s) => s.chatOpen);
  const toggleChat = useStore((s) => s.toggleChat);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 glass-card"
      style={{
        background: 'rgba(15, 17, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        borderRadius: '0',
      }}
    >
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}
          >
            <Zap size={20} style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="font-bold text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Command Center
          </span>
        </Link>

        {/* Center Navigation Tabs */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-tab flex items-center gap-2 ${
                isActive(path) ? 'active' : ''
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all"
            style={{
              background: 'rgba(99, 102, 241, 0.05)',
              color: 'var(--color-text-secondary)',
            }}
            title="Refresh data"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all"
            style={{
              background: 'rgba(99, 102, 241, 0.05)',
              color: 'var(--color-text-secondary)',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Code Editor Toggle */}
          <button
            onClick={toggleEditor}
            className={`p-2 rounded-lg transition-all ${
              editorOpen ? 'bg-opacity-50' : 'hover:bg-opacity-50'
            }`}
            style={{
              background: editorOpen
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(99, 102, 241, 0.05)',
              color: editorOpen
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)',
            }}
            title="Toggle code editor"
          >
            <Code size={18} />
          </button>

          {/* AI Chat Toggle */}
          <button
            onClick={toggleChat}
            className={`p-2 rounded-lg transition-all relative ${
              chatOpen ? 'bg-opacity-50' : 'hover:bg-opacity-50'
            }`}
            style={{
              background: chatOpen
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(99, 102, 241, 0.05)',
              color: chatOpen
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)',
            }}
            title="Toggle AI chat"
          >
            <MessageCircle size={18} />
            {chatOpen && (
              <div
                className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--color-green)' }}
              />
            )}
          </button>

          {/* Connection Status Indicators */}
          <div className="flex items-center gap-2 ml-4 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
            {[
              { name: 'Shopify', color: '#96bf48' },
              { name: 'Meta', color: '#1877f2' },
              { name: 'Google', color: '#ea4335' },
              { name: 'Klaviyo', color: '#4d4d4d' },
              { name: 'GA4', color: '#f16428' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="status-dot"
                style={{ background: platform.color }}
                title={`${platform.name} Connected`}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
