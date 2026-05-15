import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { getUser, clearAuth } from '../lib/auth';
import { authApi } from '../lib/api';

export function Layout() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
    navigate({ to: '/login' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#1e293b', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56 }}>
        <Link to="/dashboard" style={{ color: 'white', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
          SkillsHub
        </Link>
        <div style={{ flex: 1, display: 'flex', gap: 16 }}>
          {user?.role === 'hr' && (
            <>
              <Link to="/employees" style={{ color: '#94a3b8', textDecoration: 'none' }}>Employees</Link>
              <Link to="/search" style={{ color: '#94a3b8', textDecoration: 'none' }}>Search</Link>
              <Link to="/queue" style={{ color: '#94a3b8', textDecoration: 'none' }}>Review Queue</Link>
            </>
          )}
          {user?.role === 'employee' && (
            <Link to="/profile" style={{ color: '#94a3b8', textDecoration: 'none' }}>My Profile</Link>
          )}
        </div>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>
          Logout
        </button>
      </nav>
      <main style={{ flex: 1, padding: 24, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
