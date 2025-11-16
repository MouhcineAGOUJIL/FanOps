export const Header = ({ userType }) => {
  console.log('Header rendering with userType:', userType);
  return (
    <header 
      className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 p-4"
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px'
      }}
    >
      <div 
        className="flex items-center justify-between"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h1 
          className="text-2xl font-bold text-white"
          style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}
        >
          CAN 2025 FanOps Platform
        </h1>
        <div 
          className="text-white/70"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          {userType === 'admin' ? 'Admin' : 'Fan'} Dashboard
        </div>
      </div>
    </header>
  );
};

