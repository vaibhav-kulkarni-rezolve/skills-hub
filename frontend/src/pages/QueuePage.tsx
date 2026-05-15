import { useState, useEffect } from 'react';
import { profilesApi } from '../lib/api';
import type { Profile } from '../lib/api';

export function QueuePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    profilesApi.getQueue().then(setProfiles).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await (action === 'approve' ? profilesApi.approve(id) : profilesApi.reject(id));
      setProfiles(p => p.filter(pr => pr.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <p>Loading queue...</p>;

  return (
    <div>
      <h1>Review Queue</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        {profiles.length === 0 ? 'No profiles pending review.' : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} awaiting review`}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {profiles.map(profile => (
          <div key={profile.id} style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>{profile.user?.name}</h3>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>{profile.user?.email}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleAction(profile.id, 'reject')} disabled={actionLoading === profile.id}
                  style={{ padding: '8px 16px', background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, cursor: 'pointer' }}>
                  Reject
                </button>
                <button onClick={() => handleAction(profile.id, 'approve')} disabled={actionLoading === profile.id}
                  style={{ padding: '8px 16px', background: '#16a34a', border: 'none', color: 'white', borderRadius: 6, cursor: 'pointer' }}>
                  Approve
                </button>
              </div>
            </div>
            {profile.summary && <p style={{ color: '#374151', marginBottom: 12 }}>{profile.summary}</p>}
            {profile.location && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>Location: {profile.location}</p>}
            {profile.profileSkills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {profile.profileSkills.map(ps => (
                  <span key={ps.id} style={{ padding: '3px 10px', background: ps.inferred ? '#fef9c3' : '#eff6ff', color: ps.inferred ? '#854d0e' : '#3b82f6', borderRadius: 12, fontSize: 13 }}>
                    {ps.skill.name} · {ps.proficiency}{ps.inferred ? ' (inferred)' : ''}
                  </span>
                ))}
              </div>
            )}
            {profile.projects?.length > 0 && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Projects:</p>
                {profile.projects.map(p => (
                  <p key={p.id} style={{ margin: '0 0 4px', fontSize: 14, color: '#475569' }}>
                    <strong>{p.title}</strong> — {p.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
