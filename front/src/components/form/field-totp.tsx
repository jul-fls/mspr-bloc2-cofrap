import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { REGEXP_ONLY_DIGITS } from "input-otp";

interface FieldTotpProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  separator?: boolean;
  className?: string;
}

export default function FieldTOTP({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  separator = false,
  className,
}: Readonly<FieldTotpProps>) {
  return (
    <div className="grid gap-3">
      {label && <Label htmlFor={id}>{label}</Label>}
      <InputOTP
        id={id}
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={className}
      >
        <InputOTPGroup className="space-x-1">
          <InputOTPSlot index={0} className="rounded-md border-l" />
          <InputOTPSlot index={1} className="rounded-md border-l" />
          <InputOTPSlot index={2} className="rounded-md border-l" />
          {separator && <InputOTPSeparator />}
          <InputOTPSlot index={3} className="rounded-md border-l" />
          <InputOTPSlot index={4} className="rounded-md border-l" />
          <InputOTPSlot index={5} className="rounded-md border-l" />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
