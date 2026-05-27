import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-2xl">
            🥃
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finish</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your bourbon journal
          </p>
        </div>
        <LoginForm from={from ?? "/"} />
      </div>
    </main>
  );
}
