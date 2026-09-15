import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { env } from "@/env.js";
import { chatPostBodySchema } from "@/lib/chat/request";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import type { ChatMessage } from "@/lib/chat/tools";
import { chatTools } from "@/lib/chat/tools";

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Request body is not valid JSON", 400);
  }

  const parsed = chatPostBodySchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid request payload";
    return jsonError(message, 400);
  }

  const messages = parsed.data.messages as ChatMessage[];

  try {
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
  } catch (error) {
    console.error("Chat stream failed:", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonError(
      "Unable to process your message right now. Please try again.",
      500,
    );
  }
}
