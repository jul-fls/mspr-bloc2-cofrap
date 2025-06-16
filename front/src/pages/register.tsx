import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generatePassword } from "@/lib/api";
import { FormHeader } from "../components/form/header";
import { FormField } from "../components/form/field";
import { PasswordGeneration } from "../components/form/password-generation";
import { ErrorAlert } from "../components/error-alert";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onLoginClick?: () => void;
}

// Formulaire d'inscription
export function RegisterForm({
  className,
  onLoginClick,
  ...props
}: Readonly<RegisterFormProps>) {
  const [username, setUsername] = useState("");
  const [showPasswordGeneration, setShowPasswordGeneration] = useState(false);

  const registerMutation = useMutation({
    mutationFn: generatePassword,
    onSuccess: () => {
      setShowPasswordGeneration(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username });
  };

  if (showPasswordGeneration) {
    return (
      <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
        <FormHeader
          title="Inscription réussie"
          linkText="Vous avez déjà un compte ?"
          linkLabel="Se connecter"
          onLinkClick={onLoginClick}
        />

        <PasswordGeneration
          username={username}
          onComplete={onLoginClick}
          title="Votre compte a été créé avec succès !"
          completionButtonText="Aller à la page de connexion"
          autoGenerate={true}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <FormHeader
            title="S'inscrire"
            linkText="Vous avez déjà un compte ?"
            linkLabel="Se connecter"
            onLinkClick={onLoginClick}
          />

          <ErrorAlert error={registerMutation.error} />

          <div className="flex flex-col gap-6">
            <FormField
              id="username"
              label="Nom d'utilisateur"
              placeholder="Votre nom d'utilisateur"
              value={username}
              onChange={setUsername}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Chargement..." : "Créer un compte"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
