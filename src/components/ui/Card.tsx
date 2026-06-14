import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-ink/10 bg-white shadow-soft", className)} {...props} />;
}

export function SectionTitle({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-veld">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold text-ink md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

