import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { employeesApi, type User, type Profile } from '../lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function EmployeesPage() {
  const [employees, setEmployees] = useState<(User & { profile: Profile | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeesApi.list().then(setEmployees).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Loading employees...</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
        <p className="text-muted-foreground mt-1">{employees.length} employees</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <Link key={emp.id} to="/employees/$id" params={{ id: emp.id }} className="no-underline text-foreground">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {emp.profile?.location && (
                  <p className="text-xs text-muted-foreground">📍 {emp.profile.location}</p>
                )}
                {emp.profile?.status && (
                  <Badge variant={emp.profile.status === 'approved' ? 'success' : emp.profile.status === 'pending' ? 'warning' : 'destructive'}>
                    {emp.profile.status}
                  </Badge>
                )}
                {emp.profile?.profileSkills && emp.profile.profileSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {emp.profile.profileSkills.slice(0, 4).map(ps => (
                      <Badge key={ps.id} variant="outline" className="text-xs">{ps.skill.name}</Badge>
                    ))}
                    {emp.profile.profileSkills.length > 4 && (
                      <span className="text-xs text-muted-foreground self-center">+{emp.profile.profileSkills.length - 4}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
