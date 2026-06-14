import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base font-medium leading-relaxed text-slate-500 sm:text-lg">
          {description}
        </p>
      )}
      <div
        className={cn(
          "mt-8 h-1 w-12 rounded-full bg-slate-200",
          align === "center" && "mx-auto"
        )}
        aria-hidden="true"
      />
    </div>
  );
}
