import { Label } from "@/components/ui/label";

interface QRCodeDisplayProps {
  label: string;
  qrCode: string | null;
  alt: string;
  secret?: string | null;
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
      {qrCode ? (
        <img src={qrCode} alt={alt} className="w-48 h-48" />
      ) : (
        <div className="text-center h-48 flex items-center justify-center">
          Génération du QR Code en cours...
        </div>
      )}
      {secret && (
        <div>
          <code className="p-1 bg-gray-200 rounded text-sm">{secret}</code>
        </div>
      )}
    </div>
  );
}
