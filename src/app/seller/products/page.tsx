import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ProductForm } from "@/components/SellerForms";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function SellerProductsPage() {
  const session = await auth();
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: session!.user.id } });
  const [products, categories, countries] = await Promise.all([
    prisma.product.findMany({ where: { sellerId: seller!.id }, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Seller products" eyebrow="Inventory owned by sellers" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit p-6"><ProductForm categories={categories} countries={countries} /></Card>
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <h2 className="font-bold">{product.name}</h2>
                <p className="text-sm text-ink/60">{product.category.name} • {product.status}</p>
              </div>
              <strong>{formatMoney(String(product.price))}</strong>
              <span className="text-sm font-bold">{product.stock} units</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

