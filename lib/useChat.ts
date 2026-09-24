"use client";

import { useCallback, useState } from "react";
import type { ChatContext, ContentPart, Message } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

/** Local interaction for the archived interface preview. No requests leave the browser. */
export function useChat(initialContext: ChatContext) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ChatContext>(initialContext);

  const send = useCallback(
    (parts: ContentPart[], overrides?: Partial<ChatContext>) => {
      if (overrides) setContext((current) => ({ ...current, ...overrides }));
      const now = Date.now();
      setMessages((current) => [
        ...current,
        { id: uid(), role: "user", content: parts, createdAt: now },
        {
          id: uid(),
          role: "assistant",
          content: [{ type: "text", text: "This is a UI-only preview. Answers are unavailable here." }],
          createdAt: now,
        },
      ]);
    },
    [],
  );

  const reset = useCallback(() => setMessages([]), []);
  const stop = useCallback(() => {}, []);

  return { messages, context, setContext, send, stop, reset, busy: false };
}
