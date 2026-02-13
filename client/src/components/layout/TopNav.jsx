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
  Menu,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../providers/AuthProvider';
import { useState, useEffect, useRef } from 'react';

export default function TopNav() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const editorOpen = useStore((s) => s.editorOpen);
  const toggleEditor = useStore((s) => s.toggleEditor);
  const chatOpen = useStore((s) => s.chatOpen);
  const toggleChat = useStore((s) => s.toggleChat);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const isActive = (path) => location.pathname === path;
  const prevPathRef = useRef(location.pathname);

  // Close mobile menu when navigation occurs
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      // This setState within effect is intentional - we update state based on navigation change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileMenuOpen(false);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 glass-card transition-all duration-300"
      style={{
        background: 'rgba(15, 17, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        borderRadius: '0',
      }}
    >
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 flex-shrink-0">
          <div
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}
          >
            <Zap size={20} style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="font-bold text-lg hidden sm:inline"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Slay Season
          </span>
        </Link>

        {/* Center Navigation Tabs - Hidden on mobile, visible on sm and up */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {/* eslint-disable-next-line no-unused-vars */}
          {navItems.map(({ path, label, icon: NavIcon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-tab flex items-center gap-2 ${
                isActive(path) ? 'active' : ''
              }`}
            >
              <NavIcon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh - Always visible */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all duration-300"
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

          {/* Theme Toggle - Always visible */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all duration-300"
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

          {/* Code Editor Toggle - Hidden on mobile */}
          <button
            onClick={toggleEditor}
            className={`p-2 rounded-lg transition-all duration-300 hidden sm:block ${
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

          {/* AI Chat Toggle - Hidden on mobile */}
          <button
            onClick={toggleChat}
            className={`p-2 rounded-lg transition-all duration-300 hidden sm:flex relative ${
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

          {/* Connection Status Indicators - Hidden on mobile, visible on lg */}
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
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

          {/* User & Logout */}
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="p-2 rounded-lg hover:bg-opacity-50 transition-all duration-300 hidden sm:block"
            style={{
              background: 'rgba(239, 68, 68, 0.05)',
              color: 'var(--color-text-secondary)',
            }}
            title="Log out"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile Menu Button - Visible only on mobile (md and below) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-opacity-50 transition-all duration-300"
            style={{
              background: 'rgba(99, 102, 241, 0.05)',
              color: 'var(--color-text-secondary)',
            }}
            title="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t transition-all duration-300 animate-slideDown"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="px-4 py-2 space-y-1">
            {/* eslint-disable-next-line no-unused-vars */}
            {navItems.map(({ path, label, icon: MobileNavIcon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive(path) ? 'active' : ''
                }`}
                style={{
                  background: isActive(path) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive(path) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
                <MobileNavIcon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
