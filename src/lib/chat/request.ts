import { z } from "zod";

const chatMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["user", "assistant", "system"]),
    parts: z.array(z.unknown()),
  })
  .loose();

export const chatPostBodySchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required"),
});

export type ChatPostBody = z.infer<typeof chatPostBodySchema>;
