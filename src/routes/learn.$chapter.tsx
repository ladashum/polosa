import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { chapterBySlug, CHAPTERS } from "@/data/chapters";
import { QUESTIONS } from "@/data/questions";
import { Shell } from "@/components/shell";
import { usePdd } from "@/lib/pdd-store";

export const Route = createFileRoute("/learn/$chapter")({ component: ChapterPage });

function ChapterPage() {
  const { chapter: slug } = Route.useParams();
  const chapter = chapterBySlug(slug);
  const seeChapter = usePdd((s) => s.seeChapter);
  const start = usePdd((s) => s.start);

  useEffect(() => {
    if (chapter) seeChapter(chapter.slug);
  }, [chapter, seeChapter]);

  if (!chapter) {
    return (
      <Shell>
        <p>Такого урока нет.</p>
        <Link to="/learn" className="mt-4 inline-flex text-signal">
          Ко всем урокам
        </Link>
      </Shell>
    );
  }

  const index = CHAPTERS.findIndex((item) => item.slug === chapter.slug);
  const next = CHAPTERS[index + 1];
  const checks = QUESTIONS.filter((q) => q.topic === chapter.slug).slice(0, 3);

  return (
    <Shell>
      <Link to="/learn" className="text-sm text-muted">
        Все уроки
      </Link>
      <p className="mt-4 text-xs font-medium tracking-widest text-signal">
        {chapter.km} · {chapter.minutes} МИН · {chapter.ref}
      </p>
      <h1 className="font-display mt-2 text-4xl leading-tight">{chapter.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{chapter.scene}</p>

      <section className="mt-6 rounded-2xl bg-paper p-5 text-ink">
        <p className="text-xs font-semibold tracking-widest text-ink/60">ПРАВИЛО</p>
        <p className="mt-2 text-lg leading-relaxed">{chapter.rule}</p>
        <p className="mt-4 text-xs font-semibold tracking-widest text-ink/60">КРЮЧОК</p>
        <p className="font-display mt-2 text-2xl leading-snug">{chapter.hook}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl">Держи в голове</h2>
        <ul className="mt-3 grid gap-2">
          {chapter.points.map((point) => (
            <li key={point} className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed">
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface-2 p-4">
        <p className="text-xs font-semibold tracking-widest text-signal">ЛОВУШКА БИЛЕТА</p>
        <p className="mt-2 leading-relaxed">{chapter.trap}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">Проверь на трёх вопросах</h2>
        <div className="mt-4 grid gap-4">
          {checks.map((q) => (
            <Check key={q.id} question={q} />
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/exam"
          onClick={() => start("topic", chapter.slug)}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-signal px-5 font-semibold text-ink"
        >
          Все вопросы темы
        </Link>
        {next ? (
          <Link
            to="/learn/$chapter"
            params={{ chapter: next.slug }}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-line px-5"
          >
            Дальше: {next.title}
          </Link>
        ) : null}
      </div>
    </Shell>
  );
}

function Check({
  question,
}: {
  question: { text: string; options: string[]; answer: number; why: string; hook: string };
}) {
  const [pick, setPick] = useState<number | null>(null);
  const revealed = pick !== null;
  return (
    <article className="rounded-2xl bg-paper p-4 text-ink">
      <p className="font-medium leading-relaxed">{question.text}</p>
      <div className="mt-3 grid gap-2">
        {question.options.map((option, index) => {
          const chosen = pick === index;
          const correct = index === question.answer;
          let tone = "border-paper-line bg-paper";
          if (revealed && correct) tone = "border-ok bg-ok text-paper";
          else if (revealed && chosen) tone = "border-danger bg-danger text-paper";
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => setPick(index)}
              className={`min-h-12 rounded-2xl border px-3 py-2 text-left text-sm leading-snug ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="mt-3 text-sm leading-relaxed">
          <p className="font-semibold">{question.hook}</p>
          <p className="mt-1 text-ink/80">{question.why}</p>
        </div>
      ) : null}
    </article>
  );
}
