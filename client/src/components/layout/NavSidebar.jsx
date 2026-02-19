import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Zap,
  Crown,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';

const navSections = [
  {
    label: 'MAIN',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/orders', label: 'Orders', icon: ShoppingCart },
      { path: '/products', label: 'Products', icon: Package },
      { path: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { path: '/reports', label: 'Reports', icon: BarChart3 },
      { path: '/forecast', label: 'Forecast', icon: TrendingUp },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/help', label: 'Help & Support', icon: HelpCircle },
    ],
  },
];

export default function NavSidebar({ collapsed, onToggleCollapse, isMobile = false }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { colors, theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarWidth = collapsed ? 72 : 240;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 ${collapsed ? 'px-3 py-6 justify-center' : 'px-5 py-6'}`}>
        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight" style={{ color: colors.text }}>Slay Season</span>
        )}
      </div>

      {/* Collapse button */}
      <div className={`px-3 mb-2 hidden md:flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg transition-all duration-200"
          style={{ color: colors.textTertiary }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.textTertiary; e.currentTarget.style.background = 'transparent'; }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 px-3 mt-1 space-y-5 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-3 mb-2 category-label">
                {section.label}
              </div>
            )}
            {collapsed && <div className="mb-1" />}
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${collapsed ? 'px-0 justify-center' : 'px-3'}`}
                  style={{
                    background: isActive(path) ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                    color: isActive(path) ? colors.accentLight : colors.textSecondary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(path)) {
                      e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = colors.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(path)) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = colors.textSecondary;
                    }
                  }}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade Card */}
      {!collapsed ? (
        <div className="px-4 mb-4">
          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-indigo-200 mb-3">
              Unlock advanced analytics and forecasting.
            </p>
            <button
              className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 mb-4 flex justify-center">
          <div
            className="p-2.5 rounded-xl cursor-pointer transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            title="Upgrade to Pro"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Crown size={16} className="text-yellow-300" />
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="px-3 pb-4">
        {!collapsed ? (
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: colors.text }}>
                {user?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-[11px]" style={{ color: colors.textTertiary }}>Free Plan</div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="p-1.5 rounded-lg transition-colors duration-200 flex-shrink-0"
              style={{ color: colors.textTertiary }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.textTertiary; }}
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              title={user?.email || 'User'}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ color: colors.textTertiary }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.textTertiary; }}
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl md:hidden"
        style={{ background: colors.bgCard, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex-shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: mobileOpen ? 240 : sidebarWidth,
          background: colors.bgSidebar,
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
        }}
      >
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-3 p-1 rounded-lg md:hidden"
            style={{ color: colors.textTertiary }}
          >
            <X size={18} />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
}
