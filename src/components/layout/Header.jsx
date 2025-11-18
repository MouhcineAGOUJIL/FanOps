import cafLogo from '../../assets/afcon2025_logo.png';

const navLinks = ['Home', 'News', 'Videos', 'Calendar', 'Volunteers', 'Jobs', 'Qualifiers', 'Archive'];

export const Header = ({ userType }) => {
  return (
    <header
      style={{
        padding: '28px 0 8px',
      }}
    >
      <div
        className="flex flex-col gap-6 lg:flex-row lg:items-center"
        style={{
          padding: '18px 28px',
          borderRadius: '24px',
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex items-center gap-4">
          <img
            src={cafLogo}
            alt="CAF Morocco 2025"
            style={{
              height: '70px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            }}
          />
          <div>
            <p
              style={{
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '0.4em',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '4px',
              }}
            >
              TotalEnergies
            </p>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 700,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              AFCON 2025 FanOps            </h1>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-6"
          style={{ flex: 1 }}
        >
          {navLinks.map((link, index) => (
            <button
              key={link}
              type="button"
              className={`nav-link${index === 0 ? ' active' : ''}`}
            >
              {link}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span
            className="pill"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            {userType === 'admin' ? 'Admin Center' : 'Fan Cockpit'}
          </span>
          <button
            style={{
              background: 'linear-gradient(120deg, #15a657, #0e8042)',
              border: 'none',
              borderRadius: '999px',
              padding: '0.75rem 1.8rem',
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 15px 30px rgba(14, 128, 66, 0.45)',
              cursor: 'pointer',
            }}
          >
            Launch Console
          </button>
        </div>
      </div>
    </header>
  );
};

