import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import FanDashboard from './pages/fan/FanDashboard';
import FanGateStatus from './pages/fan/GateStatus';
import FanPromotions from './pages/fan/Promotions';

import AdminDashboard from './pages/admin/Dashboard';
import AdminGateMonitoring from './pages/admin/GateMonitoring';
import AdminTicketValidation from './pages/admin/TicketValidation';
import AdminForecast from './pages/admin/ForecastView';
import AdminSponsor from './pages/admin/SponsorAnalytics';

function App() {
  console.log('App component rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Fan Routes */}
        <Route path="/fan" element={<MainLayout userType="fan" />}>
          <Route index element={<FanDashboard />} />
          <Route path="gates/:gateId" element={<FanGateStatus />} />
          <Route path="promotions" element={<FanPromotions />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<MainLayout userType="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gates" element={<AdminGateMonitoring />} />
          <Route path="tickets" element={<AdminTicketValidation />} />
          <Route path="forecast" element={<AdminForecast />} />
          <Route path="sponsors" element={<AdminSponsor />} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/fan" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
