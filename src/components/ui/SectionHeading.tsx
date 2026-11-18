import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"} ${className}`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">
            <span className="h-px w-6 bg-olive/60" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl leading-[1.15] sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-charcoal/70">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
