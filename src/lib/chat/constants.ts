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

/** Human-readable labels for tool activity in the chat UI. */
export const CHAT_TOOL_LABELS: Record<ChatToolName, string> = {
  listBookings: "Looking up bookings",
  getBooking: "Looking up booking",
  createBooking: "Creating booking",
  updateBooking: "Updating booking",
  deleteBooking: "Deleting booking",
  listClients: "Looking up clients",
  upsertClient: "Updating client",
  updateSettings: "Updating settings",
  getDashboardSummary: "Checking dashboard",
};

export const CHAT_TOOL_DONE_LABELS: Partial<Record<ChatToolName, string>> = {
  listBookings: "Bookings loaded",
  getBooking: "Booking loaded",
  createBooking: "Booking created",
  updateBooking: "Updated",
  deleteBooking: "Deleted",
  listClients: "Clients loaded",
  upsertClient: "Client saved",
  updateSettings: "Settings updated",
  getDashboardSummary: "Dashboard checked",
};

export const CHAT_EXAMPLE_PROMPTS = [
  "What's my total revenue?",
  "How many bookings have I completed?",
  "Show my revenue by month",
  "Set my monthly income goal to $3,000",
] as const;
