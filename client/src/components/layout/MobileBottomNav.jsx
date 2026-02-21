import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: HomeIcon,
      path: '/dashboard',
      color: 'var(--color-blue)'
    },
    {
      id: 'attribution',
      label: 'Attribution',
      icon: ChartBarIcon,
      path: '/attribution',
      color: 'var(--color-purple)'
    },
    {
      id: 'profit',
      label: 'P&L',
      icon: CurrencyDollarIcon,
      path: '/profit-loss',
      color: 'var(--color-green)'
    },
    {
      id: 'predictions',
      label: 'Insights',
      icon: ArrowTrendingUpIcon,
      path: '/predictions',
      color: 'var(--color-accent)'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserCircleIcon,
      path: '/settings',
      color: 'var(--color-text-secondary)'
    }
  ];

  const NavigationItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;

    return (
      <button
        onClick={() => navigate(item.path)}
        className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
          isActive ? 'scale-105' : 'scale-100'
        }`}
      >
        <div 
          className={`p-2 rounded-xl mb-1 transition-all ${
            isActive ? 'shadow-lg' : ''
          }`}
          style={{
            background: isActive 
              ? `linear-gradient(135deg, ${item.color}30, ${item.color}15)` 
              : 'transparent'
          }}
        >
          <IconComponent 
            className="h-5 w-5" 
            style={{ color: isActive ? item.color : 'var(--color-text-secondary)' }}
          />
        </div>
        <span 
          className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}
          style={{ color: isActive ? item.color : 'var(--color-text-secondary)' }}
        >
          {item.label}
        </span>
        
        {/* Active indicator */}
        {isActive && (
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
            style={{ background: item.color }}
          />
        )}
      </button>
    );
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg"
      style={{ 
        background: 'var(--color-bg-card)F0',
        borderTop: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {navItems.map((item) => (
          <div key={item.id} className="relative flex-1 max-w-[20%]">
            <NavigationItem item={item} />
          </div>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;