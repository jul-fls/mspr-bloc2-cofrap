import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "@/contexts/auth-context";

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
      // Utiliser les données du formaire pour créer l'utilisateur
      const user = {
        username: username,
      };
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">COFRAP</span>
            </div>
            <h1 className="text-xl font-bold">Se connecter</h1>
            <div className="text-center text-sm">
              Vous n'avez pas de compte ?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => onRegisterClick?.()}
              >
                Créer un compte
              </Button>
            </div>
          </div>

          {/* Alert */}
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
            <div className="grid gap-3">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="Votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="totp">Code d'authentification (2FA)</Label>
              <Input
                id="totp"
                type="text"
                placeholder="Entrez le code 2FA"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                required
              />
            </div>

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
