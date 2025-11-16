import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = ({ userType }) => {
  console.log('MainLayout rendering with userType:', userType);
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        color: 'white'
      }}
    >
      <Header userType={userType} />
      <div className="flex" style={{ display: 'flex' }}>
        <Sidebar userType={userType} />
        <main className="flex-1 p-6" style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};