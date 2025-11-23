import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import cafLogo from '../../assets/afcon2025_logo.png';

const navLinks = [
  { label: 'Home', url: '/' },
  { label: 'News', url: 'https://www.cafonline.com/afcon2025/news/' },
  { label: 'Videos', url: 'https://www.cafonline.com/afcon2025/videos/' },
  { label: 'Calendar', url: 'https://www.cafonline.com/media/epqkudrg/match-schedule_totalenergies-caf-africa-cup-of-nations_morocco25.pdf' },
  { label: 'Volunteers', url: 'https://www.cafonline.com/afcon2025/volunteers/' },
  { label: 'Jobs', url: 'https://www.cafonline.com/afconjobs/' },
  { label: 'Qualifiers', url: 'https://www.cafonline.com/afcon2025/qualifiers/' },
  { label: 'Archive', url: 'https://www.cafonline.com/afcon2025/archive/2023/' }
];

export const Header = ({ userType }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

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
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : '_self'}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="nav-link"
              style={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,1)'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(120deg, #8B0000, #600000)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '0.6rem 1.5rem',
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(139, 0, 0, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(120deg, #600000, #400000)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(120deg, #8B0000, #600000)'}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

