import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon,
  BoltIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const AppleStyleSidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['analytics', 'business']);

  const menuSections = [
    {
      id: 'main',
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: HomeIcon,
          path: '/dashboard',
          color: 'var(--color-blue)'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      expandable: true,
      items: [
        {
          id: 'attribution',
          label: 'Attribution',
          icon: ChartBarIcon,
          path: '/attribution',
          color: 'var(--color-purple)',
          badge: 'NEW',
          description: 'Multi-touch attribution across all channels'
        },
        {
          id: 'predictions',
          label: 'Predictions',
          icon: SparklesIcon,
          path: '/predictions',
          color: 'var(--color-accent)',
          description: 'AI-powered forecasting and insights'
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: DocumentTextIcon,
          path: '/reports',
          color: 'var(--color-green)'
        }
      ]
    },
    {
      id: 'business',
      title: 'Business Intelligence',
      expandable: true,
      items: [
        {
          id: 'profit-loss',
          label: 'Profit & Loss',
          icon: CurrencyDollarIcon,
          path: '/profit-loss',
          color: 'var(--color-green)',
          badge: 'PRO',
          description: 'Real-time P&L tracking and analysis'
        },
        {
          id: 'ltv',
          label: 'LTV Analysis',
          icon: ArrowTrendingUpIcon,
          path: '/ltv',
          color: 'var(--color-orange)'
        },
        {
          id: 'marketing',
          label: 'Marketing',
          icon: BoltIcon,
          path: '/marketing',
          color: 'var(--color-red)'
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      expandable: true,
      items: [
        {
          id: 'customers',
          label: 'Customers',
          icon: UserGroupIcon,
          path: '/customers',
          color: 'var(--color-purple)'
        },
        {
          id: 'products',
          label: 'Products',
          icon: ShoppingBagIcon,
          path: '/products',
          color: 'var(--color-blue)'
        },
        {
          id: 'orders',
          label: 'Orders',
          icon: DocumentTextIcon,
          path: '/orders',
          color: 'var(--color-orange)'
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const NavigationItem = ({ item, isSubItem = false }) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;

    return (
      <button
        onClick={() => navigate(item.path)}
        className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
          isActive ? 'shadow-lg' : ''
        }`}
        style={{
          background: isActive 
            ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)` 
            : 'transparent',
          border: isActive ? `1px solid ${item.color}40` : '1px solid transparent'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Icon */}
        <div 
          className={`flex-shrink-0 p-2 rounded-xl transition-all ${
            isActive ? 'shadow-sm' : ''
          }`}
          style={{
            background: isActive ? item.color + '20' : 'var(--color-bg-secondary)',
          }}
        >
          <IconComponent 
            className="h-5 w-5" 
            style={{ color: isActive ? item.color : 'var(--color-text-secondary)' }}
          />
        </div>

        {/* Label & Description */}
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}
                style={{ color: isActive ? item.color : 'var(--color-text-primary)' }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: item.badge === 'NEW' ? 'var(--color-green)' : 'var(--color-accent)',
                    color: 'white'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && !isCollapsed && (
              <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div 
            className="absolute right-2 w-1.5 h-8 rounded-full"
            style={{ background: item.color }}
          />
        )}
      </button>
    );
  };

  const SectionHeader = ({ section }) => {
    const isExpanded = expandedSections.includes(section.id);
    
    if (!section.expandable) {
      return !isCollapsed && (
        <h3 className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider" 
            style={{ color: 'var(--color-text-muted)' }}>
          {section.title}
        </h3>
      );
    }

    return (
      <button
        onClick={() => toggleSection(section.id)}
        className="w-full flex items-center justify-between px-4 py-2 mb-2 rounded-xl hover:bg-opacity-50 transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {!isCollapsed && (
          <>
            <h3 className="text-xs font-semibold uppercase tracking-wider" 
                style={{ color: 'var(--color-text-muted)' }}>
              {section.title}
            </h3>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            ) : (
              <ChevronRightIcon className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full z-40 border-r transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      style={{ 
        background: 'var(--color-bg-card)',
        borderRight: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-purple))' }}
            >
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Slay Season
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                E-commerce Analytics
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-xl hover:bg-opacity-50 transition-colors"
          style={{ background: 'var(--color-bg-hover)' }}
        >
          <ChevronRightIcon 
            className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuSections.map((section) => {
          const isExpanded = !section.expandable || expandedSections.includes(section.id);
          
          return (
            <div key={section.id}>
              <SectionHeader section={section} />
              {isExpanded && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavigationItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t" style={{ borderTop: '1px solid var(--color-border)' }}>
        <NavigationItem 
          item={{
            id: 'settings',
            label: 'Settings',
            icon: CogIcon,
            path: '/settings',
            color: 'var(--color-text-secondary)'
          }}
        />
      </div>
    </div>
  );
};

export default AppleStyleSidebar;