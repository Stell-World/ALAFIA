import { Link } from "@tanstack/react-router";

import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 whitespace-nowrap rounded-full bg-mint-soft p-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-soft"
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href="/inscription"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:text-sm"
        >
          Créer un compte
        </a>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-7">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group flex flex-col items-center gap-1 px-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <span className="grid h-8 w-12 place-items-center rounded-full transition-colors group-data-[status=active]:bg-secondary">
                <item.icon className="size-5" aria-hidden />
              </span>
              {item.short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
