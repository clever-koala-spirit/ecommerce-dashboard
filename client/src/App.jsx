import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ForecastPage from './pages/ForecastPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
