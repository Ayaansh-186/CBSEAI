import { Suspense } from "react";
import { ChatView } from "@/components/chat/ChatView";

export default function Page() {
  return (
    <Suspense fallback={<div className="sheet flex-1" />}>
      <ChatView />
    </Suspense>
  );
}
