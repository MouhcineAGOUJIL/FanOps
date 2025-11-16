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
      className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-white/10 p-4"
      style={{
        width: '256px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px'
      }}
    >
      <nav className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              style={{
                display: 'block',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: isActive ? '#9333ea' : 'transparent',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {route.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

