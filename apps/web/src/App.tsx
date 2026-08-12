import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { router } from './routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const toastClassName =
  '!rounded-lg !border !border-border !bg-surface !text-foreground !text-sm !shadow-sm';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            className: toastClassName,
            success: { iconTheme: { primary: '#3DBE6A', secondary: '#FAFAF9' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#FAFAF9' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
