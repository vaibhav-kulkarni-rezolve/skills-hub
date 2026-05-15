import { useNavigate } from '@tanstack/react-router';
import { getUser } from '../lib/auth';

export function DashboardPage() {
  const user = getUser();
  const navigate = useNavigate();

  if (user?.role === 'hr') {
    return (
      <div>
        <h1>Welcome, {user.name}</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>HR Dashboard — manage your team's skills intelligence</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Search Employees', desc: 'Natural language search across all skills', path: '/search' },
            { label: 'Review Queue', desc: 'Approve or reject AI-extracted profiles', path: '/queue' },
            { label: 'Employee Directory', desc: 'Browse all employee profiles', path: '/employees' },
          ].map(card => (
            <div key={card.path} onClick={() => navigate({ to: card.path as '/search' | '/queue' | '/employees' })}
              style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <h3 style={{ marginBottom: 8 }}>{card.label}</h3>
              <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your skills profile</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 600 }}>
        {[
          { label: 'My Profile', desc: 'View and update your skills profile', path: '/profile' },
        ].map(card => (
          <div key={card.path} onClick={() => navigate({ to: card.path as '/profile' })}
            style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>
            <h3 style={{ marginBottom: 8 }}>{card.label}</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
