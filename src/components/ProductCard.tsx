import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@prisma/client";
import { addToCart } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ProductWithRelations = Product & {
  category: { name: string };
  seller: { businessName: string };
  images: { url: string; alt: string }[];
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0];
  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-aloe">
          {image ? <Image src={image.url} alt={image.alt} fill className="object-cover" /> : null}
        </div>
        <div className="grid gap-2 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-veld">{product.category.name}</p>
          <h2 className="line-clamp-2 min-h-12 text-lg font-bold">{product.name}</h2>
          <p className="text-sm text-ink/65">{product.seller.businessName}</p>
          <p className="text-xl font-black">{formatMoney(String(product.price))}</p>
        </div>
      </Link>
      <form action={addToCart.bind(null, product.id)} className="px-4 pb-4">
        <Button className="w-full" disabled={product.stock < 1}>
          <ShoppingCart size={18} /> {product.stock > 0 ? "Add to cart" : "Sold out"}
        </Button>
      </form>
    </Card>
  );
}

