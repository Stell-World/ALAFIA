import { Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Notice({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "warning";
  className?: string;
}) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
        tone === "warning"
          ? "border-warning-foreground/20 bg-warning-soft text-warning-foreground"
          : "border-mint bg-card text-foreground",
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", tone === "warning" ? "" : "text-nature-deep")}
        aria-hidden
      />
      <div>{children}</div>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl space-y-3", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-nature-deep">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-semibold leading-tight md:text-3xl">{title}</h2>
      {description && <p className="leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}

