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
import SecurityDashboard from './pages/admin/SecurityDashboard';
import FlowManagement from './pages/admin/FlowManagement';

import ScanPage from './pages/gatekeeper/ScanPage';
import LoginPage from './pages/auth/LoginPage';

import HomePage from './pages/public/HomePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Fan Routes */}
        <Route path="/fan" element={<MainLayout userType="fan" />}>
          <Route index element={<FanDashboard />} />
          <Route path="gates/:gateId" element={<FanGateStatus />} />
          <Route path="promotions" element={<FanPromotions />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout userType="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="gates" element={<AdminGateMonitoring />} />
          <Route path="forecast" element={<AdminForecast />} />
          <Route path="sponsors" element={<AdminSponsor />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="flow" element={<FlowManagement />} />
        </Route>

        {/* Gatekeeper Routes */}
        <Route
          path="/gatekeeper"
          element={
            <ProtectedRoute allowedRoles={['gatekeeper']}>
              <MainLayout userType="gatekeeper" />
            </ProtectedRoute>
          }
        >
          <Route index element={<ScanPage />} />
          <Route path="scan" element={<ScanPage />} />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
