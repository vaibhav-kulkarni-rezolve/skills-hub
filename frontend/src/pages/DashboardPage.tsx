import { useNavigate } from '@tanstack/react-router'
import { getUser } from '../lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ClipboardList, Users, User } from 'lucide-react'

const HR_CARDS = [
  { label: 'Search Employees', desc: 'Natural language search across all skills', path: '/search', icon: Search },
  { label: 'Review Queue', desc: 'Approve or reject AI-extracted profiles', path: '/queue', icon: ClipboardList },
  { label: 'Employee Directory', desc: 'Browse all employee profiles', path: '/employees', icon: Users },
]

const EMPLOYEE_CARDS = [
  { label: 'My Profile', desc: 'View and update your skills profile', path: '/profile', icon: User },
]

export function DashboardPage() {
  const user = getUser()
  const navigate = useNavigate()
  const cards = user?.role === 'hr' ? HR_CARDS : EMPLOYEE_CARDS

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'hr' ? "Manage your team's skills intelligence" : 'Manage your skills profile'}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.path} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: card.path as any })}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{card.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.desc}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
