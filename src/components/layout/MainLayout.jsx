import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = ({ userType }) => {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 25% 0%, rgba(255, 255, 255, 0.08), transparent 45%), rgba(120, 3, 3, 1)',
        color: 'hsl(var(--text))',
      }}
    >
      <div className="flex min-h-screen w-full flex-col px-6 sm:px-10" style={{ gap: '32px' }}>
        <Header userType={userType} />
        <div
          className="flex flex-1 flex-col gap-6 pb-12 lg:flex-row"
          style={{ flex: 1 }}
        >
          <Sidebar userType={userType} />
          <main
            className="flex-1 rounded-[32px]"
            style={{
              background: 'linear-gradient(130deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '40px',
              boxShadow: '0 40px 85px rgba(0,0,0,0.4)',
            }}
          >
            <Outlet />
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
};