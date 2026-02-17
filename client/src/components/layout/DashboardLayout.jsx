import { Outlet } from 'react-router-dom';
import NavSidebar from './NavSidebar';
import FilterBar from './FilterBar';
import Sidebar from './Sidebar';
import AIChatPanel from '../ai/AIChatPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import { useStore } from '../../store/useStore';

export default function DashboardLayout() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)', transition: 'background-color 0.3s ease' }}>
      {/* Left Navigation Sidebar */}
      <NavSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Top Bar */}
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
