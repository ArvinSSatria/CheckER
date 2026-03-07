import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Analyzing profile..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
    </div>
  );
}
