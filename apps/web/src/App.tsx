import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { LoginDialog } from '@/components/auth/LoginForm';
import { ToastProvider } from '@/components/ui/toast';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
          <LoginDialog />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
