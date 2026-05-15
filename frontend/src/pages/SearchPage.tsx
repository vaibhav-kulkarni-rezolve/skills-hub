import { useState } from 'react';
import { searchApi } from '../lib/api';
import type { SearchResult } from '../lib/api';

const EXAMPLE_QUERIES = [
  'Who can lead a React project that also needs WebSocket experience?',
  'Find backend developers with Java and payment gateway integration',
  'Senior frontend engineers with TypeScript expertise',
];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchApi.search(q);
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Talent Search</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Ask in plain English — find the right people for your project</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Who can lead a React project with WebSocket experience?"
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16 }}
        />
        <button onClick={() => handleSearch()} disabled={loading}
          style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {!searched && (
        <div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>Try an example:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXAMPLE_QUERIES.map(q => (
              <button key={q} onClick={() => { setQuery(q); handleSearch(q); }}
                style={{ textAlign: 'left', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#475569' }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <p style={{ color: '#64748b' }}>No matches found. Try a different query.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {results.map(result => (
          <div key={result.profileId} style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <h3 style={{ margin: 0 }}>{result.profile?.user?.name}</h3>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>{result.profile?.location}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: result.matchScore >= 80 ? '#16a34a' : result.matchScore >= 60 ? '#d97706' : '#64748b' }}>
                  {result.matchScore}%
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>match</div>
              </div>
            </div>
            <p style={{ color: '#374151', margin: '12px 0', fontStyle: 'italic' }}>"{result.reasoning}"</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {result.highlights.map((h, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#eff6ff', color: '#3b82f6', borderRadius: 12, fontSize: 13 }}>{h}</span>
              ))}
            </div>
            {result.profile?.profileSkills?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.profile.profileSkills.slice(0, 8).map(ps => (
                  <span key={ps.id} style={{ padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: 4, fontSize: 12 }}>
                    {ps.skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
