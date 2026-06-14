import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, PackageCheck, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params;
  const product = await prisma.product.findFirst({
    where: { id: routeParams.id, status: "APPROVED" },
    include: { images: true, category: true, seller: { include: { country: true } }, availability: { include: { country: true } }, reviews: true }
  });
  if (!product) notFound();

  const image = product.images[0];
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-aloe">
        {image ? <Image src={image.url} alt={image.alt} fill className="object-cover" priority /> : null}
      </div>
      <div className="grid content-start gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-veld">{product.category.name}</p>
          <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
          <p className="mt-3 text-ink/70">{product.description}</p>
        </div>
        <p className="text-3xl font-black">{formatMoney(String(product.price))}</p>
        <Card className="grid gap-3 p-5 text-sm">
          <p className="flex items-center gap-2 font-bold"><PackageCheck size={18} /> {product.stock} in stock</p>
          <p className="flex items-center gap-2"><CheckCircle2 size={18} className="text-veld" /> Sold by {product.seller.businessName}</p>
          <p className="flex items-center gap-2"><MapPin size={18} /> Ships from {product.seller.country.name}</p>
          <p className="text-ink/65">{product.deliveryNotes}</p>
          <p className="text-ink/65">
            Available in {product.availability.map((item) => item.country.name).join(", ")}
          </p>
        </Card>
        <form action={addToCart.bind(null, product.id)}>
          <Button className="w-full" disabled={product.stock < 1}>
            <ShoppingCart size={18} /> Add to cart
          </Button>
        </form>
      </div>
    </div>
  );
}
