import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoNext = true,
}: Readonly<StepNavigationProps>) {
  return (
    <div className="flex gap-4">
      {currentStep > 1 && onPrevious && (
        <Button variant="secondary" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      )}
      {currentStep < totalSteps && onNext && canGoNext && (
        <Button onClick={onNext}>
          Suivant
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
