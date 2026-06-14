import { cn } from "@/lib/utils";

export function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium text-ink", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-veld focus:ring-2 focus:ring-veld/20";

