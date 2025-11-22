import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = ({ userType }) => {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'radial-gradient(circle at 25% 0%, rgba(255, 255, 255, 0.08), transparent 45%), rgba(120, 3, 3, 1)',
        color: 'hsl(var(--text))',
      }}
    >
      {/* Moroccan Zelij Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('/moroccan_zelij_red_1763840057262.png')`,
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
          opacity: 0.15,
          zIndex: 0
        }}
      />
      {/* Overlay gradient for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-red-950/30 via-transparent to-red-950/50 pointer-events-none" style={{ zIndex: 0 }} />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-6 sm:px-10" style={{ gap: '32px' }}>
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