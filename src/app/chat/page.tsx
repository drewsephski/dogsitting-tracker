import type { Metadata } from "next";
import { Shell } from "@/components/shell";

import { ChatPanel } from "./_components/chat-panel";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <Shell className="gap-0 py-4 md:py-6">
      <div className="mb-4 px-1">
        <h1 className="font-semibold text-lg tracking-tight">Assistant</h1>
        <p className="text-muted-foreground text-sm">
          Update bookings and clients in natural language. Changes save to your
          database immediately.
        </p>
      </div>
      <ChatPanel />
    </Shell>
  );
}
