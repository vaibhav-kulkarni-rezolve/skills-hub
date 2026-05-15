import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { employeesApi } from '../lib/api';
import type { User, Profile } from '../lib/api';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<(User & { profile: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi.list().then(setEmployees).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading employees...</p>;

  return (
    <div>
      <h1>Employee Directory</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>{employees.length} employees</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {employees.map(emp => (
          <Link key={emp.id} to="/employees/$id" params={{ id: emp.id }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ padding: 20, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: 12 }}>
                {emp.name.charAt(0)}
              </div>
              <h3 style={{ margin: '0 0 4px' }}>{emp.name}</h3>
              <p style={{ color: '#64748b', margin: '0 0 8px', fontSize: 13 }}>{emp.email}</p>
              {emp.profile?.location && <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 8px' }}>Location: {emp.profile.location}</p>}
              {emp.profile?.status && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: emp.profile.status === 'approved' ? '#dcfce7' : emp.profile.status === 'pending' ? '#fef9c3' : '#fee2e2', color: emp.profile.status === 'approved' ? '#16a34a' : emp.profile.status === 'pending' ? '#854d0e' : '#dc2626' }}>
                  {emp.profile.status}
                </span>
              )}
              {emp.profile?.profileSkills && emp.profile.profileSkills.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {emp.profile.profileSkills.slice(0, 4).map(ps => (
                    <span key={ps.id} style={{ fontSize: 11, padding: '1px 6px', background: '#f1f5f9', color: '#475569', borderRadius: 4 }}>{ps.skill.name}</span>
                  ))}
                  {emp.profile.profileSkills.length > 4 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{emp.profile.profileSkills.length - 4}</span>}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
