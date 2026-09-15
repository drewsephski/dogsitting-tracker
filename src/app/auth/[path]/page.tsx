import { AuthView } from "@neondatabase/auth-ui";
import { authViewPaths } from "@neondatabase/auth-ui/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { resolveRedirectTo } from "@/lib/auth/redirect-to";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

interface AuthPageProps {
  params: Promise<{ path: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthPage({
  params,
  searchParams,
}: AuthPageProps) {
  await connection();

  const { path } = await params;
  const query = await searchParams;
  const { data: session } = await auth.getSession();

  const redirectParam = Array.isArray(query.redirectTo)
    ? query.redirectTo[0]
    : query.redirectTo;

  if (
    session?.user &&
    (path === authViewPaths.SIGN_IN || path === authViewPaths.SIGN_UP)
  ) {
    redirect(resolveRedirectTo(redirectParam));
  }

  return (
    <div className="container flex min-h-[calc(100dvh-3.5rem)] items-center justify-center py-10">
      <RedirectIfAuthenticated path={path} />
      <div className="w-full max-w-md">
        <AuthView path={path} />
      </div>
    </div>
  );
}
