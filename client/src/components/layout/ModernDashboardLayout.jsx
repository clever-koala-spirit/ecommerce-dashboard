import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AppleStyleSidebar from '../navigation/AppleStyleSidebar';
import ModernTopBar from './ModernTopBar';
import MobileBottomNav from './MobileBottomNav';

const ModernDashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div 
      className="min-h-screen flex"
      style={{ background: 'var(--color-bg-page)' }}
    >
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <AppleStyleSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Top Bar */}
        <ModernTopBar 
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main 
          className={`transition-all duration-300 ${
            isMobile ? 'pb-20' : 'pb-0'
          }`}
        >
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default ModernDashboardLayout;