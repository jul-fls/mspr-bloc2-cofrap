import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";

// Créer une instance de QueryClient
const queryClient = new QueryClient();

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onRegisterClick={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onLoginClick={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
