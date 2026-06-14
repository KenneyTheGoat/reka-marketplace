import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SellerApplicationForm } from "@/components/SellerForms";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function SellerApplyPage() {
  const session = await auth();
  const [countries, seller] = await Promise.all([
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    session?.user ? prisma.sellerProfile.findUnique({ where: { userId: session.user.id } }) : null
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <SectionTitle title="Apply to sell" eyebrow="Verified seller onboarding" />
      {seller ? (
        <Card className="mb-5 p-5">
          <p className="font-bold">Current application status: {seller.status}</p>
          <p className="mt-2 text-sm text-ink/60">Admin approval unlocks the seller dashboard and product submission.</p>
        </Card>
      ) : null}
      <Card className="p-6"><SellerApplicationForm countries={countries} /></Card>
    </div>
  );
}

