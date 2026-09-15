"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CHAT_EXAMPLE_PROMPTS,
  CHAT_TOOL_DONE_LABELS,
  CHAT_TOOL_LABELS,
  CHAT_TOOL_NAMES,
  type ChatToolName,
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

function toolNameFromPartType(type: ChatToolPartType): ChatToolName {
  return type.replace("tool-", "") as ChatToolName;
}

interface ToolActivityPartProps {
  type: ChatToolPartType;
  state?: string;
  output?: unknown;
  errorText?: string;
}

function ToolActivityPart({ part }: { part: ToolActivityPartProps }) {
  const toolName = toolNameFromPartType(part.type);
  const activeLabel = CHAT_TOOL_LABELS[toolName];
  const doneLabel = CHAT_TOOL_DONE_LABELS[toolName] ?? "Done";
  const state = part.state;

  if (state === "output-error") {
    return (
      <p className="text-destructive text-xs" role="status">
        {activeLabel} — something went wrong.
        {process.env.NODE_ENV === "development" && part.errorText ? (
          <span className="mt-1 block font-mono text-[10px] opacity-80">
            {part.errorText}
          </span>
        ) : null}
      </p>
    );
  }

  if (state === "output-available" && "output" in part) {
    return (
      <div className="text-muted-foreground text-xs">
        <p className="text-foreground/70">{doneLabel}</p>
        <details className="mt-1">
          <summary className="cursor-pointer text-[11px] opacity-60 hover:opacity-100">
            Developer details
          </summary>
          <pre className="mt-1 max-h-32 overflow-auto rounded-md border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed">
            {JSON.stringify(part.output, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <p
      className="text-muted-foreground text-xs"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="mr-1.5 inline size-3 animate-spin"
        aria-hidden="true"
      />
      {activeLabel}…
    </p>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const textParts = message.parts.filter(
    (part) => part.type === "text" && part.text.trim(),
  );
  const toolParts = message.parts.filter((part) => isToolPart(part.type));

  if (!isUser && textParts.length === 0 && toolParts.length > 0) {
    return (
      <div className="flex flex-col gap-2 py-1">
        {toolParts.map((part, index) => {
          const toolPart: ToolActivityPartProps = {
            type: part.type as ChatToolPartType,
            state: "state" in part ? String(part.state) : undefined,
            output: "output" in part ? part.output : undefined,
            errorText: "errorText" in part ? part.errorText : undefined,
          };
          return (
            <ToolActivityPart
              key={`${message.id}-tool-${index}`}
              part={toolPart}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1",
        isUser ? "items-end" : "items-start",
      )}
    >
      {isUser ? (
        <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
          {textParts.map((part, index) => (
            <p
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap"
            >
              {part.type === "text" ? part.text : null}
            </p>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-none space-y-3 text-sm leading-relaxed">
          {toolParts.map((part, index) => {
            const toolPart: ToolActivityPartProps = {
              type: part.type as ChatToolPartType,
              state: "state" in part ? String(part.state) : undefined,
              output: "output" in part ? part.output : undefined,
              errorText: "errorText" in part ? part.errorText : undefined,
            };
            return (
              <ToolActivityPart
                key={`${message.id}-tool-${index}`}
                part={toolPart}
              />
            );
          })}
          {textParts.map((part, index) => (
            <p
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap text-foreground/90"
            >
              {part.type === "text" ? part.text : null}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

interface ChatPanelProps {
  className?: string;
}

const SCROLL_NEAR_BOTTOM_PX = 120;

export function ChatPanel({ className }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [draft, setDraft] = useState("");

  const { messages, sendMessage, status, error, clearError } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/chat",
      }),
    });

  const isBusy = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    function handleScroll() {
      const container = scrollRef.current;
      if (!container) return;
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      stickToBottomRef.current = distanceFromBottom < SCROLL_NEAR_BOTTOM_PX;
    }

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTriggerKey = `${messages.length}:${messages.at(-1)?.id ?? ""}:${messages.at(-1)?.parts.length ?? 0}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when message content streams in
  useEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollToBottom(status === "streaming" ? "auto" : "smooth");
  }, [scrollTriggerKey, status, scrollToBottom]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    clearError();
    stickToBottomRef.current = true;
    sendMessage({ text: trimmed });
    setDraft("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSend(draft);
  }

  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    handleSend(draft);
  }

  const showEmptyState = messages.length === 0 && !isBusy;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
          {showEmptyState ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
              <div className="space-y-2">
                <h2 className="font-medium text-base">
                  Ask about your business
                </h2>
                <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
                  I use your live bookings, clients, and settings. I won&apos;t
                  guess dates or dollar amounts.
                </p>
              </div>
              <ul className="flex w-full max-w-lg flex-col gap-2">
                {CHAT_EXAMPLE_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-2">
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
            </div>
          )}

          {error ? (
            <div
              className="mx-auto mt-4 w-full max-w-3xl rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
              role="alert"
            >
              <p>
                Something went wrong while processing that message. Try again.
              </p>
              {process.env.NODE_ENV === "development" ? (
                <p className="mt-1 font-mono text-destructive text-xs">
                  {error.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
        </div>
      </div>

      <div className="shrink-0 border-t bg-background/95 px-4 py-3 backdrop-blur-sm md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2"
          aria-label="Send a message"
        >
          <Textarea
            name="message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Message the assistant…"
            disabled={isBusy}
            autoComplete="off"
            aria-label="Message"
            rows={1}
            className="max-h-40 min-h-10 resize-none py-2.5"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isBusy || !draft.trim()}
            aria-label={isBusy ? "Sending message" : "Send message"}
            className="shrink-0"
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
