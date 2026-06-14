import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";
import { Card, SectionTitle } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SectionTitle title="Create account" eyebrow="Customer access" />
      <Card className="p-6">
        <RegisterForm />
        <p className="mt-5 text-sm text-ink/65">
          Already registered? <Link className="font-bold text-veld" href="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}

