import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function NavSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div
          className="p-2 rounded-xl"
          style={{ background: 'rgba(99, 102, 241, 0.15)' }}
        >
          <Zap size={20} style={{ color: '#818cf8' }} />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">
          Slay Season
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive(path)
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'transparent',
                color: isActive(path) ? '#818cf8' : '#9ca3af',
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
      </nav>

      {/* User Profile */}
      <div className="px-3 pb-5 mt-auto">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </div>
            <div
              className="text-xs px-1.5 py-0.5 rounded-md inline-block mt-0.5 font-medium"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}
            >
              Pro
            </div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="p-1.5 rounded-lg transition-colors duration-200"
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
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-60 z-50 flex-shrink-0 transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#111827',
          borderRight: '1px solid #1f2937',
        }}
      >
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-3 p-1 rounded-lg md:hidden"
          style={{ color: '#6b7280' }}
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
