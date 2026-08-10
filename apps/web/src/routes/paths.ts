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
    transactions: '/dashboard/transactions',
    users: '/dashboard/users',
    organization: '/dashboard/organization',
    auditLogs: '/dashboard/audit-logs',
    profile: '/dashboard/profile',
  },
} as const;
