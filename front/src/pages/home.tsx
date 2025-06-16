import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { Dashboard } from "./dashboard";
import { LoginForm } from "./login";
import { RegisterForm } from "./register";

export function Home() {
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
