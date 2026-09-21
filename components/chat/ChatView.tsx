"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APP } from "@/lib/config";
import { SUBJECT_MAP, chapterName } from "@/lib/data/syllabus";
import { useChat } from "@/lib/useChat";
import type { ChatContext, SubjectId } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { AnswerSheet } from "./AnswerSheet";
import { UserBubble } from "./UserBubble";
import { Composer } from "./Composer";

const OPENERS = [
  "Explain the three steps of photosynthesis, 3 marks",
  "Why does a 5-mark answer on Ohm's law need four lines, not three?",
  "Balance: Fe + H₂O → Fe₃O₄ + H₂",
  "Which part of Nationalism in India comes up every single year?",
];

export function ChatView() {
  const params = useSearchParams();
  const initial: ChatContext = {
    grade: APP.grade,
    subject: (params.get("subject") as SubjectId) ?? undefined,
    chapter: Number(params.get("chapter")) || undefined,
    // Weak-spot cards link straight into drill mode.
    mode: (params.get("mode") as ChatContext["mode"]) ?? "answer",
  };

  const { messages, context, setContext, send, stop, reset, busy } =
    useChat(initial);
  const bottom = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (pinned) bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, pinned]);

  const subject = context.subject ? SUBJECT_MAP[context.subject] : undefined;
  const chapter = chapterName(context.subject, context.chapter);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header
        subject={subject?.name}
        chapter={chapter}
        chapterNo={context.chapter}
        onClearScope={() => setContext({ ...context, subject: undefined, chapter: undefined })}
        onReset={reset}
        hasMessages={messages.length > 0}
      />

      <div
        className="sheet scroll-quiet min-h-0 flex-1 overflow-y-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 90);
        }}
      >
        <div className="mx-auto w-full max-w-[46rem] px-3 pb-8 md:px-5">
          {messages.length === 0 ? (
            <Empty onPick={(q) => send([{ type: "text", text: q }])} />
          ) : (
            messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} message={m} />
              ) : (
                <AnswerSheet key={m.id} message={m} />
              ),
            )
          )}
          <div ref={bottom} />
        </div>
      </div>

      <Composer
        context={context}
        busy={busy}
        onSend={send}
        onStop={stop}
        onContextChange={(next) => setContext({ ...context, ...next })}
      />
    </div>
  );
}

function Header({
  subject,
  chapter,
  chapterNo,
  onClearScope,
  onReset,
  hasMessages,
}: {
  subject?: string;
  chapter?: string;
  chapterNo?: number;
  onClearScope: () => void;
  onReset: () => void;
  hasMessages: boolean;
}) {
  return (
    <header
      className="flex items-center gap-3 border-b px-4 py-2.5 md:px-6"
      style={{ borderColor: "var(--rule)", background: "var(--surface)" }}
    >
      <div className="min-w-0 flex-1">
        <span
          className="block truncate text-[15px] leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 650 }}
        >
          {chapter ? `${chapterNo}. ${chapter}` : subject ?? "Anything from the syllabus"}
        </span>
        <span
          className="block truncate text-[11.5px]"
          style={{ color: "var(--text-faint)" }}
        >
          {subject && chapter ? subject : `Class ${APP.grade} · ${APP.board}`}
        </span>
      </div>

      {(subject || chapter) && (
        <button
          type="button"
          onClick={onClearScope}
          className="rounded-full border px-2.5 py-1 text-[11.5px]"
          style={{ borderColor: "var(--rule)", color: "var(--text-soft)" }}
        >
          Whole syllabus
        </button>
      )}

      {hasMessages && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-full p-1.5"
          style={{ color: "var(--text-faint)" }}
          aria-label="Start over"
        >
          <Icon.Reset size={17} />
        </button>
      )}
    </header>
  );
}

function Empty({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex min-h-[54vh] flex-col justify-center py-10">
      <div style={{ paddingLeft: "calc(var(--rail) + 18px)" }}>
        <h1
          className="max-w-[18ch] text-[30px] leading-[1.1] tracking-[-0.035em] md:text-[38px]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Ask it the way the paper asks it.
        </h1>
        <p
          className="mt-3 max-w-[46ch] text-[14.5px]"
          style={{ color: "var(--text-soft)" }}
        >
          You get back what you'd write on the sheet — the steps, the
          <span className="swipe"> exact NCERT wording</span>, and where each
          mark comes from.
        </p>

        <div className="mt-7 flex flex-col items-start gap-1.5">
          {OPENERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPick(q)}
              className="max-w-full rounded-full border px-3.5 py-[7px] text-left text-[13.5px] transition-colors"
              style={{ borderColor: "var(--rule)", color: "var(--text-soft)" }}
            >
              {q}
            </button>
          ))}
        </div>

        <p
          className="mt-8 flex items-center gap-1.5 text-[12px]"
          style={{ color: "var(--text-faint)" }}
        >
          <Icon.Sparkle size={13} />
          Photograph a question from your book and it reads the diagram too.
        </p>
      </div>
    </div>
  );
}
