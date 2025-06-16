import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generatePassword, generate2FA } from "@/lib/api";
import { QRCodeDisplay } from "./qr-code-display";
import { StepNavigation } from "./step-navigation";
import { FormField } from "./field";
import { ErrorAlert } from "../error-alert";

interface PasswordGenerationProps {
  username: string;
  onComplete?: () => void;
  title?: string;
  completionButtonText?: string;
  autoGenerate?: boolean;
}

// Composant pour la génération de mot de passe et de code 2FA
export function PasswordGeneration({
  username,
  onComplete,
  title = "Génération du mot de passe",
  completionButtonText = "Continuer",
  autoGenerate = false,
}: Readonly<PasswordGenerationProps>) {
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );
  const [passwordQrCode, setPasswordQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const totpMutation = useMutation({
    mutationFn: generate2FA,
    onSuccess: (data) => {
      setTotpSecret(data.secret);
      setTotpQrCode(data.qr);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: generatePassword,
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
      setPasswordQrCode(data.qr);
      setStep(1);
      totpMutation.mutate({ username });
    },
  });

  const handleGenerate = useCallback(() => {
    passwordMutation.mutate({ username });
  }, [passwordMutation, username]);

  // Auto-génération pour la création de compte
  useEffect(() => {
    if (autoGenerate && !generatedPassword && !passwordMutation.isPending) {
      handleGenerate();
    }
  }, [
    autoGenerate,
    generatedPassword,
    passwordMutation.isPending,
    handleGenerate,
  ]);

  // Page de génération de mot de passe manuelle
  if (!autoGenerate && !generatedPassword) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorAlert error={title} />
        <ErrorAlert error={passwordMutation.error} />
        <ErrorAlert error={totpMutation.error} />

        <FormField
          id="username"
          label="Nom d'utilisateur"
          value={username}
          disabled
          className="disabled:opacity-100"
        />

        <Button
          onClick={handleGenerate}
          disabled={passwordMutation.isPending}
          className="w-full"
        >
          {passwordMutation.isPending
            ? "Génération..."
            : "Générer un nouveau mot de passe"}
        </Button>
      </div>
    );
  }

  // Page d'affichage du mot de passe et du code 2FA
  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert error={totpMutation.error} />

      <FormField
        id="username"
        label="Nom d'utilisateur"
        value={username}
        disabled
        className="disabled:opacity-100"
      />

      <Alert className="border-green-500 bg-green-100">
        <AlertDescription className="text-green-950">
          <div className="font-semibold">Votre nouveau mot de passe :</div>
          <div className="mt-2 p-2 bg-green-300 rounded-md overflow-x-auto">
            <code>{generatedPassword ?? "Génération en cours..."}</code>
          </div>
          <div className="mt-2">Conservez ce mot de passe en lieu sûr!</div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center gap-6 pb-3">
        {step === 1 && (
          <QRCodeDisplay
            label="Mot de passe"
            qrCode={passwordQrCode}
            alt="QR Code du mot de passe"
            secret={generatedPassword}
          />
        )}

        {step === 2 && (
          <QRCodeDisplay
            label="Code secret 2FA"
            qrCode={totpQrCode}
            alt="QR Code 2FA"
            secret={totpSecret}
          />
        )}

        <StepNavigation
          currentStep={step}
          totalSteps={2}
          onPrevious={() => setStep(1)}
          onNext={() => setStep(2)}
        />
      </div>

      {onComplete && (
        <Button onClick={onComplete}>{completionButtonText}</Button>
      )}
    </div>
  );
}
