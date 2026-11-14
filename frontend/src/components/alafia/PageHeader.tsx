import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ icon: Icon, eyebrow, title, description, children }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-hero">
      <div className="leaf-pattern pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="container-page relative py-10 md:py-14">
        <div className="flex max-w-3xl flex-col gap-5 animate-fade-up">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-nature-deep shadow-soft">
            <span className="grid size-6 place-items-center rounded-full bg-nature text-nature-foreground">
              <Icon className="size-3.5" aria-hidden />
            </span>
            {eyebrow}
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

