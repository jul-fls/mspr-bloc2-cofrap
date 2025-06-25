import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ApiError, loginUser } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { FormHeader } from "../components/form/header";
import { FormField } from "../components/form/field";
import { PasswordGeneration } from "../components/form/password-generation";
import { ErrorAlert } from "../components/error-alert";
import FieldTOTP from "@/components/form/field-totp";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onRegisterClick?: () => void;
}

// Formulaire de connexion et de génération de mot de passe si expiré
export function LoginForm({
  className,
  onRegisterClick,
  ...props
}: Readonly<LoginFormProps>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPasswordGeneration, setShowPasswordGeneration] = useState(false);
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      const user = { username };
      login(user);
    },
    onError: (error) => {
      // Vérifier si c'est une erreur de mot de passe expiré
      if (error instanceof ApiError && error.statusCode === 403) {
        setShowPasswordGeneration(true);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password, totp });
  };

  // Reset le formulaire
  const handlePasswordGenerationComplete = () => {
    setShowPasswordGeneration(false);
    loginMutation.reset();
    setPassword("");
    setTotp("");
  };

  // Afficher le formulaire de génération de mot de passe si nécessaire
  if (showPasswordGeneration) {
    return (
      <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
        <FormHeader
          title="Renouveler le mot de passe"
          linkText="Vous n'avez pas de compte ?"
          linkLabel="Créer un compte"
          onLinkClick={onRegisterClick}
        />

        <PasswordGeneration
          username={username}
          onComplete={handlePasswordGenerationComplete}
          title="Votre mot de passe a expiré. Vous devez générer un nouveau mot de passe."
          completionButtonText="Retour à la connexion"
        />
      </div>
    );
  }

  // Formulaire de connexion classique
  return (
    <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
      <FormHeader
        title="Se connecter"
        linkText="Vous n'avez pas de compte ?"
        linkLabel="Créer un compte"
        onLinkClick={onRegisterClick}
      />

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <ErrorAlert error={loginMutation.error} />

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

            <FieldTOTP
              id="totp"
              label="Code d'authentification (2FA)"
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
