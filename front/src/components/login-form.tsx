import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/lib/api";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { FormHeader } from "./form/form-header";
import { FormField } from "./form/form-field";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onRegisterClick?: () => void;
}

export function LoginForm({
  className,
  onRegisterClick,
  ...props
}: Readonly<LoginFormProps>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      const user = { username };
      login(user);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password, totp });
  };

  return (
    <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <FormHeader
            title="Se connecter"
            linkText="Vous n'avez pas de compte ?"
            linkLabel="Créer un compte"
            onLinkClick={onRegisterClick}
          />

          {loginMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Une erreur est survenue"}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-6">
            <FormField
              id="username"
              label="Nom d'utilisateur"
              placeholder="Votre nom d'utilisateur"
              value={username}
              onChange={setUsername}
              required
            />

            <FormField
              id="password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            <FormField
              id="totp"
              label="Code d'authentification (2FA)"
              placeholder="Entrez le code 2FA"
              value={totp}
              onChange={setTotp}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Chargement..." : "Se connecter"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
