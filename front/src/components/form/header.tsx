import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

interface FormHeaderProps {
  title: string;
  linkText: string;
  linkLabel: string;
  onLinkClick?: () => void;
}

export function FormHeader({
  title,
  linkText,
  linkLabel,
  onLinkClick,
}: Readonly<FormHeaderProps>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Logo />
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="text-center text-sm">
        {linkText}{" "}
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => onLinkClick?.()}
        >
          {linkLabel}
        </Button>
      </div>
    </div>
  );
}
