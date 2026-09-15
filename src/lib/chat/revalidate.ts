import "server-only";

import { revalidatePath } from "next/cache";

const PATHS = ["/dashboard", "/bookings", "/clients"] as const;

export function revalidateAppViews() {
  for (const path of PATHS) {
    revalidatePath(path);
  }
}
