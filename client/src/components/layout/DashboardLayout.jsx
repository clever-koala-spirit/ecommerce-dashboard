import { Outlet } from 'react-router-dom';
import NavSidebar from './NavSidebar';
import FilterBar from './FilterBar';
import Sidebar from './Sidebar';
import AIChatPanel from '../ai/AIChatPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';

export default function DashboardLayout() {
  const theme = useStore((s) => s.theme);
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Left Navigation Sidebar */}
      <NavSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Filter Bar (top bar) */}
        <FilterBar />

        {/* Page Content */}
        <div className={`flex-1 overflow-y-auto relative transition-all duration-300 ${
          sidebarOpen ? 'md:pr-72' : ''
        }`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>

      {/* Right Sidebar (AI Insights) */}
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>

      {/* AI Chat Panel */}
      <ErrorBoundary>
        <AIChatPanel />
      </ErrorBoundary>
    </div>
  );
}
