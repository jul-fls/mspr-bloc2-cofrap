import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiError } from "@/lib/api";

interface ErrorAlertProps {
  error: Error | string | null | undefined;
  fallbackMessage?: string;
  className?: string;
}

export function ErrorAlert({
  error,
  fallbackMessage = "Une erreur est survenue",
  className,
}: Readonly<ErrorAlertProps>) {
  if (!error) return null;

  let errorMessage = fallbackMessage;

  if (error instanceof ApiError) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}
