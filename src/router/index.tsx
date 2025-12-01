import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { DashboardPage } from '@/pages/dashboard'
import { ChecklistsPage } from '@/pages/checklists'
import { ChecklistDetailPage } from '@/pages/checklists/[id]'
import { TemplatesPage } from '@/pages/templates'
import { SharedChecklistPage } from '@/pages/shared/checklist-view'
import TeamPage from '@/pages/team'
import SettingsPage from '@/pages/settings'
import HelpPage from '@/pages/help'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/shared/:id',
    element: <SharedChecklistPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'checklists',
        element: <ChecklistsPage />,
      },
      {
        // Redirect /checklists/new to /checklists - use dialog to create
        path: 'checklists/new',
        element: <Navigate to="/checklists" replace />,
      },
      {
        path: 'checklists/:id',
        element: <ChecklistDetailPage />,
      },
      {
        path: 'templates',
        element: <TemplatesPage />,
      },
      {
        path: 'team',
        element: <TeamPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
    ],
  },
])
