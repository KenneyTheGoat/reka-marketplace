import { prisma } from "@/lib/prisma";
import { updateSellerStatus } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function AdminSellersPage() {
  const sellers = await prisma.sellerProfile.findMany({ include: { user: true, country: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Seller approvals" eyebrow="Admin" />
      <div className="grid gap-4">
        {sellers.map((seller) => (
          <Card key={seller.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-black">{seller.businessName}</h2>
              <p className="text-sm text-ink/60">{seller.user.email} • {seller.country.name} • {seller.status}</p>
              <p className="mt-2 text-sm">{seller.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={updateSellerStatus.bind(null, seller.id, "APPROVED")}><Button>Approve</Button></form>
              <form action={updateSellerStatus.bind(null, seller.id, "REJECTED")}><Button variant="danger">Reject</Button></form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

