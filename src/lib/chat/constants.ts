/** Tool names exposed to the UI for rendering activity (client-safe). */
export const CHAT_TOOL_NAMES = [
  "listBookings",
  "getBooking",
  "createBooking",
  "updateBooking",
  "deleteBooking",
  "listClients",
  "upsertClient",
  "updateSettings",
  "getDashboardSummary",
] as const;

export type ChatToolName = (typeof CHAT_TOOL_NAMES)[number];

export const chatToolPartTypes = CHAT_TOOL_NAMES.map(
  (name) => `tool-${name}` as const,
);

export type ChatToolPartType = (typeof chatToolPartTypes)[number];
