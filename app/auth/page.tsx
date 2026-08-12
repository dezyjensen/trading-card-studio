import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm, type AuthMode } from "@/components/AuthForm";
import { BrandLogo } from "@/components/BrandMark";
import { APP_NAME } from "@/lib/brand";
import { STATIC_DEMO } from "@/lib/features";

type AuthPageProps = {
  searchParams: Promise<{ mode?: string; next?: string }>;
};

export const metadata = {
  title: `Sign in — ${APP_NAME}`,
  description: `Sign in or create a ${APP_NAME} account to save cards to your binder.`,
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  if (STATIC_DEMO) {
    redirect("/");
  }

  const params = await searchParams;
  const initialMode: AuthMode =
    params.mode === "register" ? "register" : "login";

  return (
    <main className="hero-surface relative flex min-h-full flex-1 flex-col">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 sm:py-12">
        <a
          href="/"
          className="mb-8 inline-flex self-start rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--brass)]"
          aria-label={`${APP_NAME} home`}
        >
          <BrandLogo
            markClassName="h-9 w-9 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
            wordmarkClassName="font-[family-name:var(--font-brand)] text-base font-extrabold tracking-tight text-[var(--ink)]"
          />
        </a>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-7">
          <Suspense
            fallback={
              <div className="min-h-64 animate-pulse rounded-xl bg-[var(--background)]/60" />
            }
          >
            <AuthForm initialMode={initialMode} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
          <a href="/" className="underline-offset-2 hover:text-[var(--brass)] hover:underline">
            Back to {APP_NAME}
          </a>
        </p>
      </div>
    </main>
  );
}
