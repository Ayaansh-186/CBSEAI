"use client";

import { useEffect, useRef, useState } from "react";
import { MARK_OPTIONS, MODES } from "@/lib/config";
import type { AnswerMode, ChatContext, ContentPart } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/**
 * The composer carries three controls that change the answer materially —
 * mode, marks, and an image — and nothing else. Every other setting belongs
 * on a different screen.
 *
 * Marks are here rather than buried in settings because a 1-mark answer and a
 * 5-mark answer are different answers, and students know which they're being
 * asked for.
 */
export function Composer({
  context,
  busy,
  onSend,
  onStop,
  onContextChange,
}: {
  context: ChatContext;
  busy: boolean;
  onSend: (parts: ContentPart[], overrides?: Partial<ChatContext>) => void;
  onStop: () => void;
  onContextChange: (next: Partial<ChatContext>) => void;
}) {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<{ url: string; name: string } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (busy || (!value.trim() && !image)) return;
    const parts: ContentPart[] = [];
    if (image) parts.push({ type: "image", url: image.url, alt: image.name });
    if (value.trim()) parts.push({ type: "text", text: value.trim() });
    onSend(parts);
    setValue("");
    setImage(null);
  };

  const attach = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      setImage({ url: String(reader.result), name: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="border-t px-3 pb-3 pt-2.5 md:px-6"
      style={{
        borderColor: "var(--rule)",
        background: "var(--surface)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Mode + marks */}
      <div className="no-scrollbar mb-2 flex items-center gap-1.5 overflow-x-auto">
        {MODES.map((m) => (
          <ModeChip
            key={m.id}
            mode={m}
            active={context.mode === m.id}
            onSelect={() => onContextChange({ mode: m.id })}
          />
        ))}

        <span
          className="mx-1 h-4 w-px shrink-0"
          style={{ background: "var(--rule)" }}
        />

        <div className="flex shrink-0 items-center gap-1">
          {MARK_OPTIONS.map((m) => {
            const active = context.marks === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onContextChange({ marks: active ? undefined : m })}
                className="h-[26px] w-[30px] rounded-full border text-[12px] tabular-nums transition-colors"
                style={{
                  borderColor: active ? "var(--red)" : "var(--rule)",
                  background: active ? "var(--red-soft)" : "transparent",
                  color: active ? "var(--red)" : "var(--text-faint)",
                  fontWeight: active ? 650 : 500,
                }}
                title={`Answer for ${m} mark${m > 1 ? "s" : ""}`}
              >
                {m}m
              </button>
            );
          })}
        </div>
      </div>

      {image && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.name}
            className="h-12 w-12 rounded-lg border object-cover"
            style={{ borderColor: "var(--rule)" }}
          />
          <span className="text-[12.5px]" style={{ color: "var(--text-soft)" }}>
            {image.name}
          </span>
          <button
            type="button"
            onClick={() => setImage(null)}
            className="rounded-md p-1"
            style={{ color: "var(--text-faint)" }}
            aria-label="Remove image"
          >
            <Icon.Close size={15} />
          </button>
        </div>
      )}

      <div
        className="flex items-end gap-1.5 rounded-[22px] border px-2 py-1.5"
        style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
      >
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mb-0.5 rounded-full p-2 transition-colors"
          style={{ color: "var(--text-faint)" }}
          aria-label="Add a photo of the question"
        >
          <Icon.Camera size={19} />
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) attach(file);
            e.target.value = "";
          }}
        />

        <textarea
          ref={textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Type a question, or photograph one"
          className="min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-[1.45] outline-none placeholder:opacity-60"
          style={{ color: "var(--text)" }}
        />

        <button
          type="button"
          onClick={busy ? onStop : submit}
          disabled={!busy && !value.trim() && !image}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
          style={{
            background: busy ? "var(--red)" : "var(--accent)",
            color: "#fff",
          }}
          aria-label={busy ? "Stop" : "Send"}
        >
          {busy ? (
            <span className="block h-2.5 w-2.5 rounded-[2px] bg-white" />
          ) : (
            <Icon.Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

function ModeChip({
  mode,
  active,
  onSelect,
}: {
  mode: { id: AnswerMode; label: string; hint: string };
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={mode.hint}
      className="h-[26px] shrink-0 rounded-full border px-3 text-[12.5px] transition-colors"
      style={{
        borderColor: active ? "var(--accent)" : "var(--rule)",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--text-soft)",
        fontWeight: active ? 600 : 450,
      }}
    >
      {mode.label}
    </button>
  );
}
