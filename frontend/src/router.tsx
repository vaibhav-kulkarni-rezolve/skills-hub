import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { getUser } from './lib/auth';

// Layouts
import { Layout } from './components/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SearchPage } from './pages/SearchPage';
import { QueuePage } from './pages/QueuePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { ProfilePage } from './pages/ProfilePage';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  beforeLoad: () => {
    if (getUser()) throw redirect({ to: '/dashboard' });
  },
  component: Outlet,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: '/login' });
  },
  component: () => <Layout />,
});

const loginRoute = createRoute({ getParentRoute: () => authRoute, path: '/login', component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => authRoute, path: '/register', component: RegisterPage });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/dashboard' }); },
});

const dashboardRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard', component: DashboardPage });
const searchRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/search', component: SearchPage });
const queueRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/queue', component: QueuePage });
const employeesRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/employees', component: EmployeesPage });
const employeeDetailRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/employees/$id', component: EmployeeDetailPage });
const profileRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/profile', component: ProfilePage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute.addChildren([loginRoute, registerRoute]),
  protectedRoute.addChildren([
    dashboardRoute, searchRoute, queueRoute,
    employeesRoute, employeeDetailRoute, profileRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
