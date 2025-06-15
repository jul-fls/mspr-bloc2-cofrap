import { Label } from "@/components/ui/label";

interface QRCodeDisplayProps {
  label: string;
  qrCode: string;
  alt: string;
  secret?: string;
}

export function QRCodeDisplay({
  label,
  qrCode,
  alt,
  secret,
}: Readonly<QRCodeDisplayProps>) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Label>{label}</Label>
      <img src={qrCode} alt={alt} className="w-48 h-48" />
      {secret && (
        <div>
          <code className="p-1 bg-gray-200 rounded text-sm">{secret}</code>
        </div>
      )}
    </div>
  );
}
