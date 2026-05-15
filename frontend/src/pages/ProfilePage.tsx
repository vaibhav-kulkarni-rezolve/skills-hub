import { useState, useEffect, useRef } from 'react';
import { profilesApi } from '../lib/api';
import type { Profile } from '../lib/api';

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profilesApi.getMyProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const newProfile = await profilesApi.upload(file);
      setProfile(newProfile);
      setUploadMsg('Resume uploaded! AI extraction is processing — refresh in a few seconds to see your skills.');
    } catch {
      setUploadMsg('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>My Profile</h1>
        <div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {uploading ? 'Uploading...' : 'Upload Resume (PDF)'}
          </button>
        </div>
      </div>

      {uploadMsg && (
        <div style={{ padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 24, color: '#1d4ed8' }}>
          {uploadMsg}
        </div>
      )}

      {!profile ? (
        <div style={{ textAlign: 'center', padding: 48, border: '2px dashed #e2e8f0', borderRadius: 8 }}>
          <p style={{ color: '#64748b', marginBottom: 16 }}>No profile yet. Upload your resume to get started.</p>
          <button onClick={() => fileRef.current?.click()}
            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Upload Resume
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 6, display: 'inline-block', background: profile.status === 'approved' ? '#dcfce7' : profile.status === 'pending' ? '#fef9c3' : '#fee2e2', color: profile.status === 'approved' ? '#16a34a' : profile.status === 'pending' ? '#854d0e' : '#dc2626' }}>
            Status: {profile.status}
          </div>

          {profile.summary && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16 }}>Summary</h2>
              <p style={{ color: '#374151', lineHeight: 1.6 }}>{profile.summary}</p>
            </section>
          )}

          {profile.profileSkills?.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.profileSkills.map(ps => (
                  <div key={ps.id} style={{ padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 14 }}>
                    <strong>{ps.skill.name}</strong>
                    <span style={{ color: '#64748b', marginLeft: 6 }}>{ps.proficiency}</span>
                    {ps.yearsExperience && <span style={{ color: '#94a3b8', marginLeft: 4 }}>{ps.yearsExperience}yr</span>}
                    {ps.inferred && <span style={{ color: '#d97706', marginLeft: 4, fontSize: 11 }}>(inferred)</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.projects?.length > 0 && (
            <section>
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>Projects</h2>
              {profile.projects.map(p => (
                <div key={p.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{p.title}</h3>
                  <p style={{ color: '#475569', margin: '0 0 8px', fontSize: 14 }}>{p.description}</p>
                  {p.technologies?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.technologies.map(t => (
                        <span key={t} style={{ padding: '2px 8px', background: '#e2e8f0', borderRadius: 4, fontSize: 12, color: '#475569' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
