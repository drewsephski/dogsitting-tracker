import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { env } from "@/env.js";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import type { ChatMessage } from "@/lib/chat/tools";
import { chatTools } from "@/lib/chat/tools";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: ChatMessage[] };
  const { messages } = body;

  const result = streamText({
    model: openrouter(env.OPENROUTER_MODEL),
    system: CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages, { tools: chatTools }),
    tools: chatTools,
    stopWhen: isStepCount(12),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
