const DEFAULT_POST_AUTH_PATH = "/dashboard";

/**
 * Validates a post-auth redirect target. Only same-origin internal paths are allowed.
 */
export function validateRedirectTo(
  value: string | null | undefined,
): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  if (trimmed.includes("://")) {
    return null;
  }

  if (trimmed.includes("\\")) {
    return null;
  }

  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.origin !== "http://localhost") {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function resolveRedirectTo(value: string | null | undefined): string {
  return validateRedirectTo(value) ?? DEFAULT_POST_AUTH_PATH;
}
