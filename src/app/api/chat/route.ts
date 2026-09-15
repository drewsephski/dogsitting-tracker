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
  const raw = await req.text();
  if (!raw.trim()) {
    return Response.json({ error: "Request body is empty" }, { status: 400 });
  }

  let messages: ChatMessage[];
  try {
    const body = JSON.parse(raw) as { messages?: ChatMessage[] };
    if (!body.messages || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "Request body must include a messages array" },
        { status: 400 },
      );
    }
    messages = body.messages;
  } catch {
    return Response.json(
      { error: "Request body is not valid JSON" },
      {
        status: 400,
      },
    );
  }

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
