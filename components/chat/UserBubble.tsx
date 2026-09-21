"use client";

import type { Message } from "@/lib/types";

/** The student's turn: gel-pen blue, right-aligned, tight. */
export function UserBubble({ message }: { message: Message }) {
  const images = message.content.filter((p) => p.type === "image");
  const text = message.content
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("\n");

  return (
    <div
      className="flex justify-end py-3"
      style={{ paddingLeft: "calc(var(--rail) + 18px)" }}
    >
      <div className="max-w-[min(76%,30rem)]">
        {images.length > 0 && (
          <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={(img as { url: string }).url}
                alt={(img as { alt?: string }).alt ?? "Attached question"}
                className="h-28 w-auto rounded-xl border object-cover"
                style={{ borderColor: "var(--rule)" }}
              />
            ))}
          </div>
        )}
        {text && (
          <div
            className="rounded-[var(--radius-bubble)] rounded-br-md px-3.5 py-2.5 text-[14.5px] leading-[1.5]"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
}
