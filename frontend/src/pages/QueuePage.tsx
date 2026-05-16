import { useState, useEffect } from 'react'
import { profilesApi, type Profile } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export function QueuePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    profilesApi.getQueue().then(setProfiles).finally(() => setLoading(false))
  }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      await (action === 'approve' ? profilesApi.approve(id) : profilesApi.reject(id))
      setProfiles(p => p.filter(pr => pr.id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading queue...</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          {profiles.length === 0 ? 'No profiles pending review.' : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} awaiting review`}
        </p>
      </div>
      <div className="space-y-4">
        {profiles.map(profile => (
          <Card key={profile.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{profile.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.user?.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={actionLoading === profile.id}
                    onClick={() => handleAction(profile.id, 'reject')}
                    className="text-destructive hover:text-destructive">
                    <XCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                  <Button size="sm" disabled={actionLoading === profile.id}
                    onClick={() => handleAction(profile.id, 'approve')}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.summary && <p className="text-sm">{profile.summary}</p>}
              {profile.location && <p className="text-sm text-muted-foreground">📍 {profile.location}</p>}
              {profile.profileSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.profileSkills.map(ps => (
                    <Badge key={ps.id} variant={ps.inferred ? 'warning' : 'secondary'}>
                      {ps.skill.name} · {ps.proficiency}{ps.inferred ? ' (inferred)' : ''}
                    </Badge>
                  ))}
                </div>
              )}
              {profile.projects?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Projects</p>
                  {profile.projects.map(p => (
                    <p key={p.id} className="text-sm"><strong>{p.title}</strong> — {p.description}</p>
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
