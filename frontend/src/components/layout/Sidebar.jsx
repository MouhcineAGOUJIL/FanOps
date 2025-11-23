import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, MapPin, TrendingUp, DollarSign, Activity } from 'lucide-react';

export const Sidebar = ({ userType }) => {
  const location = useLocation();

  const fanRoutes = [
    { path: '/fan', label: 'Dashboard' },
    { path: '/fan/promotions', label: 'Promotions' },
  ];

  const adminRoutes = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/flow', label: 'Flow Management', icon: Activity },
    { path: '/admin/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/admin/sponsors', label: 'Sponsors', icon: DollarSign },
    { path: '/admin/security', label: 'Security', icon: Shield }
  ];

  const gatekeeperRoutes = [
    { path: '/gatekeeper/scan', label: 'Scanner' },
  ];

  const routes = userType === 'admin' ? adminRoutes : (userType === 'gatekeeper' ? gatekeeperRoutes : fanRoutes);

  return (
    <aside
      style={{
        width: '260px',
        background: 'linear-gradient(180deg, #8B0000 0%, #4a0404 100%)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
      }}
    >
      <div style={{ marginBottom: '48px' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.45)' }}>
          Access
        </p>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '6px 0 0' }}>
          {userType === 'admin' ? 'Operations Suite' : (userType === 'gatekeeper' ? 'Gate Access' : 'Fan Experience')}
        </h3>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
            >
              <span>{route.label}</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

