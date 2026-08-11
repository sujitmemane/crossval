import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { paths } from './paths';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ItemsPage } from '../pages/items/ItemsPage';
import { ItemFormPage } from '../pages/items/ItemFormPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { OrderFormPage } from '../pages/orders/OrderFormPage';
import { UsersPage } from '../pages/users/UsersPage';
import { UserFormPage } from '../pages/users/UserFormPage';
import { OrganizationPage } from '../pages/organization/OrganizationPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={paths.dashboard.home} replace /> },
  {
    path: 'dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/new', element: <OrderFormPage /> },
          { path: 'orders/:id/edit', element: <OrderFormPage /> },
          { path: 'items', element: <ItemsPage /> },
          { path: 'items/new', element: <ItemFormPage /> },
          { path: 'items/:id/edit', element: <ItemFormPage /> },
          { path: 'organization', element: <OrganizationPage /> },
          { path: 'profile', element: <ProfilePage /> },
          {
            element: <ProtectedRoute roles={['ADMIN']} />,
            children: [
              { path: 'users', element: <UsersPage /> },
              { path: 'users/new', element: <UserFormPage /> },
              { path: 'users/:id/edit', element: <UserFormPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'auth',
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
