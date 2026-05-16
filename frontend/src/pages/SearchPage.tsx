import { useState } from 'react'
import { searchApi, type SearchResult } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

const EXAMPLE_QUERIES = [
  'Who can lead a React project that also needs WebSocket experience?',
  'Find backend developers with Java and payment gateway integration',
  'Senior frontend engineers with TypeScript expertise',
]

function MatchScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'secondary'
  return <Badge variant={variant} className="text-base font-bold px-3 py-1">{score}%</Badge>
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (q: string = query) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    setQuery(q)
    try {
      const data = await searchApi.search(q)
      setResults(data.results)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Talent Search</h1>
        <p className="text-muted-foreground mt-1">Ask in plain English — find the right people for your project</p>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. Who can lead a React project with WebSocket experience?"
          className="text-base h-11"
        />
        <Button onClick={() => handleSearch()} disabled={loading} size="lg" className="shrink-0">
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {!searched && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Try an example:</p>
          {EXAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => handleSearch(q)}
              className="block w-full text-left px-4 py-2.5 rounded-lg border bg-muted/40 hover:bg-muted text-sm transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-muted-foreground">No matches found. Try a different query.</p>
      )}

      <div className="space-y-4 mt-2">
        {results.map(result => (
          <Card key={result.profileId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">{result.profile?.user?.name}</p>
                  {result.profile?.location && (
                    <p className="text-sm text-muted-foreground">{result.profile.location}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <MatchScoreBadge score={result.matchScore} />
                  <p className="text-xs text-muted-foreground mt-1">match</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm italic text-muted-foreground">"{result.reasoning}"</p>
              <div className="flex flex-wrap gap-2">
                {result.highlights.map((h, i) => (
                  <Badge key={i} variant="secondary">{h}</Badge>
                ))}
              </div>
              {result.profile?.profileSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.profile.profileSkills.slice(0, 8).map(ps => (
                    <Badge key={ps.id} variant="outline">{ps.skill.name}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
