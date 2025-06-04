import { GalleryVerticalEnd } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2 font-medium">
      <div className="flex size-8 items-center justify-center rounded-md">
        <GalleryVerticalEnd className="size-6" />
      </div>
      <span className="sr-only">COFRAP</span>
    </div>
  );
}
