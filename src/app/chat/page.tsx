import type { Metadata } from "next";

import { ChatPanel } from "./_components/chat-panel";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <>
      <header className="container shrink-0 border-border/40 border-b px-4 py-3 md:px-6">
        <h1 className="font-semibold text-lg tracking-tight">Assistant</h1>
        <p className="text-muted-foreground text-sm">
          Update bookings and clients in natural language. Changes save to your
          database immediately.
        </p>
      </header>
      <ChatPanel className="min-h-0 flex-1 overflow-hidden" />
    </>
  );
}
