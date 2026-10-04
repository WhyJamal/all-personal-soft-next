import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  loading,
  disabled = false,
  children,
  className,
}: {
  loading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(
        "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all",
        "hover:bg-sky-500 active:translate-y-px disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
        className
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
