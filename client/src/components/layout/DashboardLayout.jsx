import { Outlet } from 'react-router-dom';
import NavSidebar from './NavSidebar';
import FilterBar from './FilterBar';
import Sidebar from './Sidebar';
import AIChatPanel from '../ai/AIChatPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';

export default function DashboardLayout() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('ss_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('ss_sidebar_collapsed', String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, always collapse sidebar and don't apply margin
  const effectiveCollapsed = isMobile ? true : sidebarCollapsed;
  const sidebarWidth = effectiveCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)', transition: 'background-color 0.3s ease' }}>
      {/* Left Navigation Sidebar - Hidden on mobile by default */}
      <div className={`${isMobile ? 'fixed z-40' : 'relative'} transition-transform duration-300`}>
        <NavSidebar 
          collapsed={effectiveCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isMobile ? '' : ''
        }`}
        style={{ 
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`
        }}
      >
        {/* Top Bar */}
        <FilterBar isMobile={isMobile} />

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto relative transition-all duration-300 ${
          sidebarOpen ? 'md:pr-72' : ''
        } ${isMobile ? 'px-4' : ''}`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>

      {/* Right Sidebar (AI Insights) - Hidden on mobile */}
      {!isMobile && (
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
      )}

      {/* AI Chat Panel - Adjust for mobile */}
      <ErrorBoundary>
        <AIChatPanel isMobile={isMobile} />
      </ErrorBoundary>
    </div>
  );
}
