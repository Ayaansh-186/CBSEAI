"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, Square, X } from "lucide-react";
import { MARK_OPTIONS, MODES } from "@/lib/config";
import type { ChatContext, ContentPart } from "@/lib/types";

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
    reader.onload = () => setImage({ url: String(reader.result), name: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="shrink-0 px-3 pb-2 md:px-6"
      style={{
        background: "var(--surface)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto w-full max-w-[48rem]">
        <div
          className="rounded-[26px] border px-3 pb-2 pt-2 shadow-sm"
          style={{ borderColor: "var(--rule)", background: "var(--input)" }}
        >
          {image && (
            <div className="mb-1 flex items-center gap-2 px-1 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.name} className="h-14 w-14 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: "var(--text-soft)" }}>
                {image.name}
              </span>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <textarea
            ref={textarea}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Message Padhle"
            className="block min-h-11 w-full resize-none bg-transparent px-2 py-2 text-[16px] leading-[1.5] outline-none placeholder:opacity-60"
            style={{ color: "var(--text)" }}
          />

          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              aria-label="Add a photo"
              title="Add a photo"
            >
              <ImagePlus size={19} />
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) attach(file);
                event.target.value = "";
              }}
            />

            <select
              value={context.mode}
              onChange={(event) => onContextChange({ mode: event.target.value as ChatContext["mode"] })}
              className="h-8 max-w-[132px] rounded-lg border-0 bg-transparent px-2 text-[12px] outline-none"
              style={{ color: "var(--text-soft)", fontWeight: 550 }}
              aria-label="Answer mode"
            >
              {MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>{mode.label}</option>
              ))}
            </select>

            <select
              value={context.marks ?? ""}
              onChange={(event) => onContextChange({
                marks: event.target.value ? Number(event.target.value) as ChatContext["marks"] : undefined,
              })}
              className="h-8 max-w-[92px] rounded-lg border-0 bg-transparent px-2 text-[12px] outline-none"
              style={{ color: "var(--text-soft)", fontWeight: 550 }}
              aria-label="Answer marks"
            >
              <option value="">Marks</option>
              {MARK_OPTIONS.map((marks) => (
                <option key={marks} value={marks}>{marks} mark{marks > 1 ? "s" : ""}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={busy ? onStop : submit}
              disabled={!busy && !value.trim() && !image}
              className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
              style={{ background: "var(--text)", color: "var(--surface)" }}
              aria-label={busy ? "Stop generating" : "Send message"}
            >
              {busy ? <Square size={13} fill="currentColor" /> : <ArrowUp size={19} strokeWidth={2.4} />}
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10.5px]" style={{ color: "var(--text-faint)" }}>
          Answers use retrieved NCERT and CBSE sources. Check important details.
        </p>
      </div>
    </div>
  );
}
