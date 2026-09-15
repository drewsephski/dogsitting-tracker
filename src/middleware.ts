import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateRedirectTo } from "@/lib/auth/redirect-to";
import { auth } from "@/lib/auth/server";

const neonAuthMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

const SIGN_IN_PATH = "/auth/sign-in";

export async function middleware(request: NextRequest) {
  const response = await neonAuthMiddleware(request);

  if (
    request.nextUrl.pathname.startsWith("/api/chat") &&
    response.status >= 300 &&
    response.status < 400
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (response.status < 300 || response.status >= 400) {
    return response;
  }

  const location = response.headers.get("location");
  if (!location) {
    return response;
  }

  const redirectTarget = new URL(location, request.url);
  const signInUrl = new URL(SIGN_IN_PATH, request.url);

  if (redirectTarget.pathname !== signInUrl.pathname) {
    return response;
  }

  if (redirectTarget.searchParams.has("redirectTo")) {
    return response;
  }

  const originalPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const safeRedirect = validateRedirectTo(originalPath);
  if (!safeRedirect) {
    return response;
  }

  redirectTarget.searchParams.set("redirectTo", safeRedirect);

  const redirectResponse = NextResponse.redirect(redirectTarget);
  for (const cookie of response.headers.getSetCookie()) {
    redirectResponse.headers.append("Set-Cookie", cookie);
  }

  return redirectResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/clients/:path*",
    "/chat/:path*",
    "/account/:path*",
    "/api/chat/:path*",
  ],
};
