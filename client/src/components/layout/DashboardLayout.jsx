import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import FilterBar from './FilterBar';
import Sidebar from './Sidebar';
import AIChatPanel from '../ai/AIChatPanel';
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
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Top Navigation */}
      <TopNav />

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden pt-32">
        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'pr-80' : ''
        }`}>
          <Outlet />
        </div>

        {/* Right Sidebar (AI Insights) */}
        <Sidebar />
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel />
    </div>
  );
}
