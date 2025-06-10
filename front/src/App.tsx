import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { Dashboard } from "./components/dashboard";
import { AuthProvider, useAuth } from "./contexts/auth-context";

// Créer une instance de QueryClient
const queryClient = new QueryClient();

function AppContent() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Dashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onRegisterClick={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onLoginClick={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
