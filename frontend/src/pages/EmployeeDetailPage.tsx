import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { employeesApi } from '../lib/api';

export function EmployeeDetailPage() {
  const { id } = useParams({ from: '/protected/employees/$id' });
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi.getById(id).then(setEmployee).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!employee) return <p>Employee not found.</p>;

  const profile = employee.profile;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>
          {employee.name.charAt(0)}
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{employee.name}</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>{employee.email}</p>
          {profile?.location && <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>Location: {profile.location}</p>}
        </div>
      </div>

      {profile?.summary && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Summary</h2>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>{profile.summary}</p>
        </section>
      )}

      {profile?.profileSkills?.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.profileSkills.map((ps: any) => (
              <div key={ps.id} style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 14 }}>
                <strong>{ps.skill.name}</strong>
                <span style={{ color: '#64748b', marginLeft: 6 }}>{ps.proficiency}</span>
                {ps.yearsExperience && <span style={{ color: '#94a3b8', marginLeft: 4 }}>{ps.yearsExperience}yr</span>}
                {ps.inferred && <span style={{ color: '#d97706', marginLeft: 4, fontSize: 11 }}>inferred</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {profile?.projects?.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {profile.projects.map((p: any) => (
              <div key={p.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{p.title}</h3>
                <p style={{ color: '#475569', margin: '0 0 8px', fontSize: 14 }}>{p.description}</p>
                {p.technologies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {p.technologies.map((t: string) => (
                      <span key={t} style={{ padding: '2px 8px', background: '#e2e8f0', borderRadius: 4, fontSize: 12, color: '#475569' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
