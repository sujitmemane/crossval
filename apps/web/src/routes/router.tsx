import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ItemsPage } from '../pages/items/ItemsPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { TransactionsPage } from '../pages/transactions/TransactionsPage';
import { UsersPage } from '../pages/users/UsersPage';
import { OrganizationPage } from '../pages/organization/OrganizationPage';
import { AuditLogsPage } from '../pages/audit-logs/AuditLogsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'items', element: <ItemsPage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: 'organization', element: <OrganizationPage /> },
          { path: 'profile', element: <ProfilePage /> },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [{ path: 'users', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'sign-in', element: <SignInPage /> },
          { path: 'sign-up', element: <SignUpPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
