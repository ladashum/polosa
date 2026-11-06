import { createFileRoute, Link } from "@tanstack/react-router";
import { CHAPTERS } from "@/data/chapters";
import { Shell } from "@/components/shell";
import { usePdd } from "@/lib/pdd-store";

export const Route = createFileRoute("/learn/")({ component: LearnIndex });

function LearnIndex() {
  const seen = usePdd((s) => s.seen);
  const hydrated = usePdd((s) => s.hydrated);

  return (
    <Shell>
      <p className="text-xs font-medium tracking-widest text-signal">УРОКИ</p>
      <h1 className="font-display mt-3 text-4xl">Десять остановок</h1>
      <p className="mt-3 max-w-xl text-muted">
        На каждой остановке одна сцена, одно правило и фраза, которую повторяешь вслух.
        Проверка сидит в конце урока.
      </p>
      <ol className="mt-8 border-l border-line">
        {CHAPTERS.map((chapter) => {
          const done = hydrated && seen.includes(chapter.slug);
          return (
            <li key={chapter.slug} className="relative pb-5 pl-6">
              <span
                className={`absolute top-2 -left-1.5 size-3 rounded-full ${done ? "bg-ok" : "bg-signal"}`}
              />
              <Link
                to="/learn/$chapter"
                params={{ chapter: chapter.slug }}
                className="block rounded-2xl border border-line bg-surface p-4"
              >
                <p className="text-xs text-muted">
                  {chapter.km} · {chapter.minutes} мин
                </p>
                <p className="mt-1 font-display text-xl">{chapter.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{chapter.hook}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}
