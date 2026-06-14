import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const query = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SectionTitle title="Sign in" eyebrow="Welcome back" />
      <Card className="p-6">
        <Suspense>
          <LoginForm callbackUrl={query.callbackUrl ?? "/"} />
        </Suspense>
        <p className="mt-5 text-sm text-ink/65">
          New to BPG Marketplace? <Link className="font-bold text-veld" href="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
