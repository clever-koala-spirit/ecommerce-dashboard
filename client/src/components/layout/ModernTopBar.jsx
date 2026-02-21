import React, { useState } from 'react';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ModernTopBar = ({ sidebarCollapsed, isMobile }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const quickActions = [
    { label: 'New Campaign', icon: '🚀', color: 'var(--color-blue)' },
    { label: 'Export Report', icon: '📊', color: 'var(--color-green)' },
    { label: 'Sync Data', icon: '🔄', color: 'var(--color-purple)' }
  ];

  return (
    <header 
      className="sticky top-0 z-30 border-b backdrop-blur-lg"
      style={{ 
        background: 'var(--color-bg-card)CC',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button className="p-2 rounded-xl hover:bg-opacity-50 transition-colors">
              <Bars3Icon 
                className="h-6 w-6" 
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </button>
          )}

          {/* Search Bar */}
          <div className="relative">
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-200 ${
                searchFocused ? 'w-80' : 'w-64'
              }`}
              style={{
                background: 'var(--color-bg-input)',
                border: searchFocused 
                  ? '2px solid var(--color-accent)' 
                  : '1px solid var(--color-border)'
              }}
            >
              <MagnifyingGlassIcon 
                className="h-5 w-5" 
                style={{ color: searchFocused ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Search analytics, products, or insights..."
                className="flex-1 bg-transparent border-0 outline-none text-sm"
                style={{ color: 'var(--color-text-primary)' }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchFocused && (
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">K</kbd>
                </div>
              )}
            </div>

            {/* Search Dropdown */}
            {searchFocused && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-xl z-50"
                style={{ 
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide" 
                          style={{ color: 'var(--color-text-muted)' }}>
                        Quick Actions
                      </h3>
                      <div className="space-y-1">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-opacity-50 transition-colors text-left"
                            style={{ background: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="text-lg">{action.icon}</span>
                            <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {action.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                All systems operational
              </span>
            </div>
            
            <div 
              className="h-6 w-px"
              style={{ background: 'var(--color-border)' }}
            />
          </div>

          {/* Theme Toggle */}
          <button 
            className="p-2 rounded-xl hover:bg-opacity-50 transition-colors"
            style={{ background: 'var(--color-bg-hover)' }}
          >
            <SunIcon 
              className="h-5 w-5" 
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2 rounded-xl hover:bg-opacity-50 transition-colors"
            style={{ background: 'var(--color-bg-hover)' }}
          >
            <BellIcon 
              className="h-5 w-5" 
              style={{ color: 'var(--color-text-secondary)' }}
            />
            {notifications > 0 && (
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--color-red)' }}
              >
                {notifications}
              </div>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-opacity-50 transition-colors"
              style={{ background: 'var(--color-bg-hover)' }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <div 
                  className="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-purple))' }}
                >
                  JD
                </div>
              </div>
              {!isMobile && (
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    John Doe
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Admin
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobile && searchFocused && (
        <div className="px-4 pb-4">
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{
              background: 'var(--color-bg-input)',
              border: '2px solid var(--color-accent)'
            }}
          >
            <MagnifyingGlassIcon 
              className="h-5 w-5" 
              style={{ color: 'var(--color-accent)' }}
            />
            <input
              type="text"
              placeholder="Search everything..."
              className="flex-1 bg-transparent border-0 outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default ModernTopBar;