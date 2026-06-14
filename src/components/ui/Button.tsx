import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-veld text-white hover:bg-ink",
        variant === "secondary" && "border border-ink/15 bg-white text-ink hover:border-veld",
        variant === "danger" && "bg-clay text-white hover:bg-ink",
        variant === "ghost" && "text-ink hover:bg-ink/5",
        className
      )}
      {...props}
    />
  );
}

