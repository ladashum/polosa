import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CHAPTERS, NEWS } from "@/data/chapters";
import { Shell } from "@/components/shell";
import { accuracyOf, usePdd } from "@/lib/pdd-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = usePdd((s) => s.hydrated);
  const streak = usePdd((s) => s.streak);
  const seen = usePdd((s) => s.seen);
  const history = usePdd((s) => s.history);
  const results = usePdd((s) => s.results);
  const [daySlug, setDaySlug] = useState(CHAPTERS[0]!.slug);

  useEffect(() => {
    setDaySlug(CHAPTERS[new Date().getDate() % CHAPTERS.length]!.slug);
  }, []);

  const day = CHAPTERS.find((chapter) => chapter.slug === daySlug) ?? CHAPTERS[0]!;
  const passed = history.filter((item) => item.mode === "exam" && item.passed).length;
  const accuracy = accuracyOf(results);

  return (
    <Shell>
      <p className="text-xs font-medium tracking-widest text-signal">РЕДАКЦИЯ 2026</p>
      <h1 className="font-display mt-3 max-w-xl text-4xl leading-tight text-fg md:text-5xl">
        Правила остаются, когда у них есть причина
      </h1>
      <div className="lane mt-5" />
      <p className="mt-5 max-w-xl text-base text-muted">
        Короткие уроки с крючком, который всплывает на вопросе, и билет с теми же
        ошибками, что на теоретическом экзамене в ГИБДД.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/train"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-signal px-5 font-semibold text-ink"
        >
          Пробный билет
        </Link>
        <Link
          to="/learn/$chapter"
          params={{ chapter: day.slug }}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-line px-5 font-medium text-fg"
        >
          Урок дня
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3">
        <Stat label="дней подряд" value={hydrated ? String(streak) : "—"} />
        <Stat label="точность" value={hydrated ? `${accuracy}%` : "—"} />
        <Stat label="сдано билетов" value={hydrated ? String(passed) : "—"} />
      </dl>

      <section className="mt-8 rounded-2xl bg-paper p-5 text-ink">
        <p className="text-xs font-semibold tracking-widest text-ink/60">КРЮЧОК ДНЯ</p>
        <h2 className="font-display mt-2 text-2xl leading-snug">{day.hook}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">{day.rule}</p>
        <Link
          to="/learn/$chapter"
          params={{ chapter: day.slug }}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold"
        >
          Открыть урок «{day.title}»
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">Что изменилось к экзамену</h2>
        <ul className="mt-4 grid gap-3">
          {NEWS.map((item) => (
            <li key={item.title} className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs text-signal">{item.date}</p>
              <p className="mt-1 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Дорога из десяти уроков</h2>
          <p className="mt-1 text-sm text-muted">
            {hydrated ? `Пройдено ${seen.length} из ${CHAPTERS.length}` : "Открой любой с того места, где путаешься"}
          </p>
        </div>
        <Link to="/learn" className="text-sm font-semibold text-signal">
          Все
        </Link>
      </section>
      <Link
        to="/situations"
        className="mt-4 flex min-h-16 items-center justify-between rounded-2xl border border-line bg-surface px-4"
      >
        <span>
          <span className="block font-semibold">Кто первый</span>
          <span className="text-sm text-muted">Шесть схем перекрёстков</span>
        </span>
        <span className="text-signal">Открыть</span>
      </Link>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-3">
      <dd className="font-display text-2xl text-signal">{value}</dd>
      <dt className="mt-1 text-xs text-muted">{label}</dt>
    </div>
  );
}
