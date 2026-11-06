import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, Signpost, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { accuracyOf, usePdd } from "@/lib/pdd-store";

const NAV = [
  { to: "/", label: "Дом", icon: Home },
  { to: "/learn", label: "Уроки", icon: BookOpen },
  { to: "/signs", label: "Знаки", icon: Signpost },
  { to: "/train", label: "Билет", icon: Ticket },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const hydrated = usePdd((s) => s.hydrated);
  const streak = usePdd((s) => s.streak);
  const results = usePdd((s) => s.results);
  const accuracy = accuracyOf(results);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Link to="/" className="px-2">
          <span className="font-display text-lg tracking-wide">ПОЛОСА</span>
          <span className="mt-1 block text-xs text-muted">ПДД 2026</span>
        </Link>
        <div className="lane mt-4 ml-2" />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors ${
                  active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-muted">
          Учебный тренажёр. На экзамене сверяйся с текстом правил.
        </p>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-display text-sm tracking-wide">ПОЛОСА</span>
          <span className="text-xs text-muted">
            {hydrated ? `${streak} дн. · ${accuracy}%` : "ПДД 2026"}
          </span>
        </header>
        <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-16">
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
                    active ? "text-signal" : "text-muted"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
