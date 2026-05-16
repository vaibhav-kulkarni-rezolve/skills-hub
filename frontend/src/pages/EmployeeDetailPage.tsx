import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { employeesApi } from '../lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export function EmployeeDetailPage() {
  const { id } = useParams({ from: '/protected/employees/$id' })
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeesApi.getById(id).then(setEmployee).finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-muted-foreground">Loading profile...</p>
  if (!employee) return <p className="text-muted-foreground">Employee not found.</p>

  const profile = employee.profile

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 text-lg">
          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground">{employee.email}</p>
          {profile?.location && <p className="text-sm text-muted-foreground mt-0.5">📍 {profile.location}</p>}
        </div>
      </div>

      {profile?.summary && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed">{profile.summary}</p></CardContent>
        </Card>
      )}

      {profile?.profileSkills?.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.profileSkills.map((ps: any) => (
                <div key={ps.id} className="flex items-center gap-1.5 border rounded-full px-3 py-1 text-sm">
                  <span className="font-medium">{ps.skill.name}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-muted-foreground capitalize">{ps.proficiency}</span>
                  {ps.yearsExperience && <span className="text-muted-foreground">{ps.yearsExperience}yr</span>}
                  {ps.inferred && <Badge variant="warning" className="text-xs py-0">inferred</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile?.projects?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Projects</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile.projects.map((p: any) => (
              <div key={p.id} className="rounded-lg bg-muted/40 p-4">
                <p className="font-medium mb-1">{p.title}</p>
                <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                {p.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.technologies.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
