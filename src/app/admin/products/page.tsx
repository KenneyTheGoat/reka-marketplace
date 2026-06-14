import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { updateProductStatus } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { seller: true, category: true, images: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Product approvals" eyebrow="Admin" />
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="grid gap-4 p-5 md:grid-cols-[120px_1fr_auto]">
            <div className="relative aspect-square overflow-hidden rounded-md bg-aloe">
              {product.images[0] ? <Image src={product.images[0].url} alt={product.name} fill className="object-cover" /> : null}
            </div>
            <div>
              <h2 className="font-black">{product.name}</h2>
              <p className="text-sm text-ink/60">{product.seller.businessName} • {product.category.name} • {product.status}</p>
              <p className="mt-2 font-bold">{formatMoney(String(product.price))} • {product.stock} in stock</p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              <form action={updateProductStatus.bind(null, product.id, "APPROVED")}><Button>Approve</Button></form>
              <form action={updateProductStatus.bind(null, product.id, "REJECTED")}><Button variant="danger">Reject</Button></form>
              <form action={updateProductStatus.bind(null, product.id, "ARCHIVED")}><Button variant="secondary">Archive</Button></form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

