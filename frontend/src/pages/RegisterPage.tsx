import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { authApi } from '../lib/api';
import { setAuth } from '../lib/auth';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' as 'hr' | 'employee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await authApi.register(form.email, form.password, form.name, form.role);
      setAuth(token, user);
      navigate({ to: '/dashboard' });
    } catch {
      setError('Registration failed. Email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <h1 style={{ marginBottom: 24 }}>Create Account</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }} required />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }} required />
        <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }} required />
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'hr' | 'employee' }))}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4 }}>
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
        </select>
        {error && <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
