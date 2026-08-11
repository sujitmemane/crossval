export const paths = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    home: '/dashboard',
    orders: '/dashboard/orders',
    items: '/dashboard/items',
    itemsNew: '/dashboard/items/new',
    itemEdit: (id: string) => `/dashboard/items/${id}/edit`,
    transactions: '/dashboard/transactions',
    users: '/dashboard/users',
    organization: '/dashboard/organization',
    auditLogs: '/dashboard/audit-logs',
    profile: '/dashboard/profile',
  },
} as const;
