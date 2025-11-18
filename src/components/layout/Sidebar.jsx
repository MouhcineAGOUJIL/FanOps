import { Link, useLocation } from 'react-router-dom';

export const Sidebar = ({ userType }) => {
  const location = useLocation();

  const fanRoutes = [
    { path: '/fan', label: 'Dashboard' },
    { path: '/fan/promotions', label: 'Promotions' },
  ];

  const adminRoutes = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/gates', label: 'Gate Monitoring' },
    { path: '/admin/tickets', label: 'Ticket Validation' },
    { path: '/admin/forecast', label: 'Forecast' },
    { path: '/admin/sponsors', label: 'Sponsors' },
  ];

  const routes = userType === 'admin' ? adminRoutes : fanRoutes;

  return (
    <aside
      style={{
        width: '260px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.45)' }}>
          Access
        </p>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '6px 0 0' }}>
          {userType === 'admin' ? 'Operations Suite' : 'Fan Experience'}
        </h3>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: 600,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                background: isActive
                  ? 'linear-gradient(120deg, rgba(23, 166, 87, 0.95), rgba(16, 122, 65, 0.9))'
                  : 'rgba(255,255,255,0.04)',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isActive ? '0 18px 30px rgba(15, 128, 66, 0.45)' : 'none',
                transition: 'all 0.2s ease',
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

