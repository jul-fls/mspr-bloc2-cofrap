import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generatePassword, generate2FA } from "@/lib/api";
import { Alert, AlertDescription } from "./ui/alert";
import { FormHeader } from "./form/form-header";
import { FormField } from "./form/form-field";
import { QRCodeDisplay } from "./form/qr-code-display";
import { StepNavigation } from "./form/step-navigation";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  onLoginClick?: () => void;
}

export function RegisterForm({
  className,
  onLoginClick,
  ...props
}: Readonly<RegisterFormProps>) {
  const [username, setUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [passwordQrCode, setPasswordQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // step 1: password QR, step 2: 2FA QR

  const totpMutation = useMutation({
    mutationFn: generate2FA,
    onSuccess: (data) => {
      setTotpSecret(data.secret);
      setTotpQrCode(data.qr);
    },
  });

  const registerMutation = useMutation({
    mutationFn: generatePassword,
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
      setPasswordQrCode(data.qr);
      setStep(1);
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
          <FormHeader
            title="S'inscrire"
            linkText="Vous avez déjà un compte ?"
            linkLabel="Se connecter"
            onLinkClick={onLoginClick}
          />

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
            <FormField
              id="username"
              label="Nom d'utilisateur"
              placeholder="Votre nom d'utilisateur"
              value={username}
              onChange={setUsername}
              required
              disabled={!!generatedPassword}
              className="disabled:opacity-100"
            />

            {generatedPassword && passwordQrCode && totpQrCode && (
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
                    <QRCodeDisplay
                      label="Mot de passe"
                      qrCode={passwordQrCode}
                      alt="QR Code du mot de passe"
                      secret={generatedPassword ?? undefined}
                    />
                  )}

                  {step === 2 && (
                    <QRCodeDisplay
                      label="Code secret 2FA"
                      qrCode={totpQrCode}
                      alt="QR Code 2FA"
                      secret={totpSecret ?? undefined}
                    />
                  )}

                  {step === 2 && totpMutation.isPending && !totpQrCode && (
                    <div className="text-center h-48 flex items-center justify-center">
                      Génération du code 2FA en cours...
                    </div>
                  )}

                  <StepNavigation
                    currentStep={step}
                    totalSteps={2}
                    onPrevious={() => setStep(1)}
                    onNext={() => setStep(2)}
                    canGoNext={!!totpQrCode}
                  />
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
