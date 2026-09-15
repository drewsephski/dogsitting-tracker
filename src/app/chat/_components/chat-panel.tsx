"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ToolUIPart } from "ai";
import { useCallback, useLayoutEffect, useMemo } from "react";
import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  CHAT_EXAMPLE_PROMPTS,
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

function isEmptyToolInput(input: unknown): boolean {
  if (input === undefined || input === null) return true;
  if (typeof input === "object" && !Array.isArray(input)) {
    return Object.keys(input as Record<string, unknown>).length === 0;
  }
  return false;
}

const chatToolCompactClass =
  "mb-0 w-full max-w-md border-border/70 shadow-sm [&_pre]:p-2 [&_pre]:text-[11px] [&_pre_code]:text-[11px] [&_pre_code]:leading-relaxed";

interface ChatToolActivityProps {
  part: {
    type: ChatToolPartType;
    state?: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}

function ChatToolActivity({ part }: ChatToolActivityProps) {
  const toolName = toolNameFromPartType(part.type);
  const title = CHAT_TOOL_LABELS[toolName];
  const state = (part.state ?? "input-streaming") as ToolPart["state"];
  const toolType = part.type as ToolUIPart["type"];

  const isRunning = state === "input-streaming" || state === "input-available";
  const showInput = part.input !== undefined && !isEmptyToolInput(part.input);

  return (
    <Tool className={chatToolCompactClass} defaultOpen={isRunning}>
      <ToolHeader
        className="gap-2 px-2.5 py-1.5 [&_.rounded-full]:gap-1 [&_.rounded-full]:px-2 [&_.rounded-full]:py-0 [&_.rounded-full]:text-[10px] [&_span.font-medium]:text-xs [&_svg.size-4]:size-3.5"
        state={state}
        title={title}
        type={toolType}
      />
      <ToolContent className="max-h-52 space-y-2 overflow-y-auto px-2.5 pt-0 pb-2.5">
        {showInput ? (
          <ToolInput
            className="space-y-1 [&_h4]:text-[10px]"
            input={part.input as ToolPart["input"]}
          />
        ) : null}
        <ToolOutput
          className="space-y-1 [&_h4]:text-[10px]"
          errorText={
            state === "output-error" && part.errorText
              ? part.errorText
              : undefined
          }
          output={
            state === "output-available" && "output" in part
              ? (part.output as ToolPart["output"])
              : undefined
          }
        />
      </ToolContent>
    </Tool>
  );
}

function ChatMessageRow({ message }: { message: ChatMessage }) {
  const textParts = message.parts.filter(
    (part) => part.type === "text" && part.text.trim(),
  );
  const toolParts = message.parts.filter((part) => isToolPart(part.type));

  if (
    message.role === "assistant" &&
    textParts.length === 0 &&
    toolParts.length > 0
  ) {
    return (
      <div className="flex w-full flex-col gap-2">
        {toolParts.map((part, index) => (
          <ChatToolActivity
            key={`${message.id}-tool-${index}`}
            part={{
              type: part.type as ChatToolPartType,
              state: "state" in part ? String(part.state) : undefined,
              input: "input" in part ? part.input : undefined,
              output: "output" in part ? part.output : undefined,
              errorText: "errorText" in part ? part.errorText : undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <Message from={message.role}>
      <MessageContent
        className={message.role === "assistant" ? "max-w-full" : undefined}
      >
        {message.role === "assistant"
          ? toolParts.map((part, index) => (
              <ChatToolActivity
                key={`${message.id}-tool-${index}`}
                part={{
                  type: part.type as ChatToolPartType,
                  state: "state" in part ? String(part.state) : undefined,
                  input: "input" in part ? part.input : undefined,
                  output: "output" in part ? part.output : undefined,
                  errorText: "errorText" in part ? part.errorText : undefined,
                }}
              />
            ))
          : null}
        {textParts.map((part, index) =>
          message.role === "user" ? (
            <p
              key={`${message.id}-text-${index}`}
              className="whitespace-pre-wrap"
            >
              {part.type === "text" ? part.text : null}
            </p>
          ) : (
            <MessageResponse key={`${message.id}-text-${index}`}>
              {part.type === "text" ? part.text : ""}
            </MessageResponse>
          ),
        )}
      </MessageContent>
    </Message>
  );
}

interface ChatPanelProps {
  className?: string;
}

function getMessagesScrollKey(messages: ChatMessage[]): string {
  return messages
    .map((message) =>
      message.parts
        .map((part) => {
          if (part.type === "text") {
            return `t:${part.text.length}`;
          }
          if ("state" in part) {
            return `${part.type}:${String(part.state)}`;
          }
          return part.type;
        })
        .join(","),
    )
    .join("|");
}

function ConversationAutoScroll({
  scrollKey,
  isStreaming,
}: {
  scrollKey: string;
  isStreaming: boolean;
}) {
  const { scrollToBottom } = useStickToBottomContext();

  useLayoutEffect(() => {
    void scrollToBottom({
      animation: isStreaming ? "smooth" : "smooth",
      duration: isStreaming ? 250 : 0,
    });
  }, [isStreaming, scrollKey, scrollToBottom]);

  return null;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const { messages, sendMessage, status, error, clearError } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/chat",
      }),
    });

  const isBusy = status === "submitted" || status === "streaming";

  const handlePromptSubmit = useCallback(
    (message: PromptInputMessage) => {
      const trimmed = message.text.trim();
      if (!trimmed || isBusy) return;
      clearError();
      sendMessage({ text: trimmed });
    },
    [clearError, isBusy, sendMessage],
  );

  const handleExamplePrompt = useCallback(
    (prompt: string) => {
      if (isBusy) return;
      clearError();
      sendMessage({ text: prompt });
    },
    [clearError, isBusy, sendMessage],
  );

  const showEmptyState = messages.length === 0 && !isBusy;
  const messagesScrollKey = useMemo(
    () => getMessagesScrollKey(messages),
    [messages],
  );

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      <Conversation
        aria-label="Chat messages"
        className="h-0 min-h-0 flex-1 px-4 md:px-6"
      >
        <ConversationContent
          className={cn(
            "mx-auto w-full max-w-3xl gap-6 pt-4 pb-2",
            showEmptyState && "flex min-h-0 flex-1 flex-col",
          )}
        >
          {showEmptyState ? (
            <ConversationEmptyState className="flex min-h-0 flex-1 flex-col justify-center py-6">
              <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
                <div className="space-y-2">
                  <h2 className="font-medium text-base">
                    Ask about your business
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    I use your live bookings, clients, and settings. I
                    won&apos;t guess dates or dollar amounts.
                  </p>
                </div>
                <ul className="flex w-full flex-col gap-2">
                  {CHAT_EXAMPLE_PROMPTS.map((prompt) => (
                    <li key={prompt}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
                        onClick={() => handleExamplePrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <ChatMessageRow key={message.id} message={message} />
            ))
          )}

          {error ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
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
        </ConversationContent>
        {!showEmptyState ? (
          <ConversationAutoScroll
            isStreaming={status === "streaming"}
            scrollKey={messagesScrollKey}
          />
        ) : null}
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t bg-background/95 px-4 py-2.5 backdrop-blur-sm md:px-6">
        <PromptInput
          className="mx-auto max-w-3xl [&_[data-slot=input-group]]:items-end"
          onSubmit={handlePromptSubmit}
        >
          <PromptInputTextarea
            className="resize-none py-0 pr-2 pl-3 text-sm leading-9"
            disabled={isBusy}
            name="message"
            placeholder="Message the assistant…"
            rows={1}
          />
          <InputGroupAddon
            align="inline-end"
            className="shrink-0 pr-1 pl-1 has-[>button]:mr-0"
          >
            <PromptInputSubmit disabled={isBusy} status={status} />
          </InputGroupAddon>
        </PromptInput>
      </div>
    </div>
  );
}
