import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { getUser, clearAuth } from '../lib/auth'
import { authApi } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BrainCircuit, Users, Search, ClipboardList, User } from 'lucide-react'

export function Layout() {
  const user = getUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    clearAuth()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg no-underline text-foreground">
            <BrainCircuit className="h-5 w-5" />
            SkillsHub
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center gap-1 flex-1">
            {user?.role === 'hr' && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/employees" className="flex items-center gap-2 no-underline"><Users className="h-4 w-4" />Employees</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/search" className="flex items-center gap-2 no-underline"><Search className="h-4 w-4" />Search</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/queue" className="flex items-center gap-2 no-underline"><ClipboardList className="h-4 w-4" />Review Queue</Link>
                </Button>
              </>
            )}
            {user?.role === 'employee' && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-2 no-underline"><User className="h-4 w-4" />My Profile</Link>
              </Button>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
