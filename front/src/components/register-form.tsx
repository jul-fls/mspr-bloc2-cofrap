import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePassword, generate2FA } from "@/lib/api";
import { Alert, AlertDescription } from "./ui/alert";
import { Logo } from "./logo";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onLoginClick?: () => void;
}

export function RegisterForm({
  className,
  onLoginClick,
  ...props
}: Readonly<RegisterFormProps>) {
  const [username, setUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // step 1: password QR, step 2: 2FA QR

  const totpMutation = useMutation({
    mutationFn: generate2FA,
    onSuccess: (data) => {
      setTotpQrCode(data.qr);
      setTotpSecret(data.secret);
    },
  });

  const registerMutation = useMutation({
    mutationFn: generatePassword,
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
      setQrCode(data.qr);
      setStep(1); // reset to step 1
      totpMutation.mutate({ username });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username });
  };

  return (
    <div className={cn("flex flex-col gap-6 m-5", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold">S'inscrire</h1>
            <div className="text-center text-sm">
              Vous avez déjà un compte ?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => onLoginClick?.()}
              >
                Se connecter
              </Button>
            </div>
          </div>

          {registerMutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
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
                disabled={!!generatedPassword}
                className="disabled:opacity-100"
              />
            </div>

            {generatedPassword && qrCode && (
              <div className="flex flex-col gap-4">
                <Alert className="border-green-500 bg-green-100">
                  <AlertDescription className="text-green-950">
                    <div className="font-semibold">
                      Votre mot de passe généré :
                    </div>
                    <div className="mt-2 p-2 bg-green-300 rounded-md overflow-x-auto">
                      <code>{generatedPassword}</code>
                    </div>
                    <div className="mt-2">
                      Conservez ce mot de passe en lieu sûr!
                    </div>
                  </AlertDescription>
                </Alert>

                {/* QR Code Display Toggle */}
                <div className="flex flex-col items-center gap-6 pb-3">
                  {step === 1 && (
                    <div className="flex flex-col items-center gap-2">
                      <Label>Mot de passe</Label>
                      <img
                        src={qrCode}
                        alt="QR Code du mot de passe"
                        className="w-48 h-48"
                      />
                    </div>
                  )}

                  {step === 2 && totpQrCode && (
                    <div className="flex flex-col items-center gap-2">
                      <Label>Code secret 2FA</Label>
                      <img
                        src={totpQrCode}
                        alt="QR Code 2FA"
                        className="w-48 h-48"
                      />
                      {totpSecret && (
                        <div>
                          <code className="p-1 bg-gray-200 rounded text-sm">
                            {totpSecret}
                          </code>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && totpMutation.isPending && !totpQrCode && (
                    <div className="text-center h-48 flex items-center justify-center">
                      Génération du code 2FA en cours...
                    </div>
                  )}

                  {/* Step Navigation Buttons */}
                  <div className="flex gap-4">
                    {step === 2 && (
                      <Button variant="secondary" onClick={() => setStep(1)}>
                        ← Retour
                      </Button>
                    )}
                    {step === 1 && totpQrCode && (
                      <Button onClick={() => setStep(2)}>
                        Suivant →
                      </Button>
                    )}
                  </div>
                </div>

                <Button onClick={onLoginClick}>
                  Aller à la page de connexion
                </Button>
              </div>
            )}

            {!generatedPassword && (
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Chargement..."
                  : "Créer un compte"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
