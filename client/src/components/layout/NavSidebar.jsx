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
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useState } from 'react';

const navSections = [
  {
    label: 'MAIN',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard#orders', label: 'Orders', icon: ShoppingCart },
      { path: '/dashboard#products', label: 'Products', icon: Package },
      { path: '/dashboard#customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { path: '/dashboard#reports', label: 'Reports', icon: BarChart3 },
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

export default function NavSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    if (path.includes('#')) return false;
    return location.pathname === path;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">Slay Season</span>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 px-3 mt-2 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-widest" style={{ color: '#6b7280' }}>
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive(path) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isActive(path) ? '#a5b4fc' : '#9ca3af',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(path)) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(path)) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade Card */}
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
            Unlock advanced analytics, forecasting, and unlimited integrations.
          </p>
          <button
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-3 pb-4">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-[11px]" style={{ color: '#6b7280' }}>Free Plan</div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="p-1.5 rounded-lg transition-colors duration-200 flex-shrink-0"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl md:hidden"
        style={{ background: '#111827', color: '#9ca3af', border: '1px solid #1f2937' }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-60 z-50 flex-shrink-0 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0c1021', borderRight: '1px solid #1e2433' }}
      >
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-3 p-1 rounded-lg md:hidden"
            style={{ color: '#6b7280' }}
          >
            <X size={18} />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
}
