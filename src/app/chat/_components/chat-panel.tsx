"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHAT_TOOL_NAMES,
  type ChatToolPartType,
} from "@/lib/chat/constants";
import type { ChatMessage } from "@/lib/chat/tools";
import { cn } from "@/lib/utils";

const toolPartTypes = new Set<string>(
  CHAT_TOOL_NAMES.map((name) => `tool-${name}`),
);

function isToolPart(type: string): type is ChatToolPartType {
  return toolPartTypes.has(type);
}

interface ToolActivityPartProps {
  type: ChatToolPartType;
  state?: string;
  output?: unknown;
  errorText?: string;
}

function ToolActivityPart({ part }: { part: ToolActivityPartProps }) {
  const toolLabel = part.type.replace("tool-", "");
  const state = "state" in part ? part.state : undefined;

  if (state === "output-error") {
    return (
      <p className="text-destructive text-xs">
        {toolLabel}: {part.errorText}
      </p>
    );
  }

  if (state === "output-available" && "output" in part) {
    return (
      <details className="text-muted-foreground text-xs">
        <summary className="cursor-pointer list-none marker:content-none">
          <span className="font-mono text-[11px]">{toolLabel}</span>
          <span className="ml-1 text-foreground/50">— done</span>
        </summary>
        <pre className="mt-1 max-h-40 overflow-auto rounded-md border bg-muted/40 p-2 font-mono text-[10px] leading-relaxed">
          {JSON.stringify(part.output, null, 2)}
        </pre>
      </details>
    );
  }

  return (
    <p className="text-muted-foreground text-xs">
      <Loader2 className="mr-1 inline size-3 animate-spin" aria-hidden="true" />
      <span className="font-mono">{toolLabel}</span>
      <span className="ml-1">…</span>
    </p>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[min(100%,42rem)] rounded-lg px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            if (!part.text.trim()) return null;
            return (
              <p
                key={`${message.id}-text-${index}`}
                className="whitespace-pre-wrap"
              >
                {part.text}
              </p>
            );
          }

          if (isToolPart(part.type)) {
            const toolPart: ToolActivityPartProps = {
              type: part.type,
              state: "state" in part ? String(part.state) : undefined,
              output: "output" in part ? part.output : undefined,
              errorText: "errorText" in part ? part.errorText : undefined,
            };
            return (
              <div
                key={`${message.id}-tool-${index}`}
                className="mt-2 border-border/50 border-t pt-2 first:mt-0 first:border-0 first:pt-0"
              >
                <ToolActivityPart part={toolPart} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      router.refresh();
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("message") ?? "").trim();
    if (!text || isBusy) return;

    sendMessage({ text });
    form.reset();
    queueMicrotask(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-1 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              Ask about bookings, clients, revenue, or planning settings. I use
              your live data and won&apos;t guess dates or amounts.
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {error ? (
            <p className="text-center text-destructive text-sm" role="alert">
              {error.message}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t bg-background/80 px-1 py-3 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl gap-2"
          aria-label="Send a message"
        >
          <Input
            name="message"
            placeholder="Message the assistant…"
            disabled={isBusy}
            autoComplete="off"
            aria-label="Message"
            className="flex-1"
          />
          <Button type="submit" disabled={isBusy} aria-label="Send message">
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
