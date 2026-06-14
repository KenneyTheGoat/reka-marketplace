import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateCartItem } from "@/lib/actions";
import { formatMoney, toNumber } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function CartPage() {
  const session = await auth();
  const cart = await prisma.cart.findUnique({
    where: { userId: session!.user.id },
    include: { items: { include: { product: { include: { images: true, seller: true } } } } }
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + toNumber(item.product.price) * item.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionTitle title="Cart" eyebrow="Checkout-ready" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-md bg-aloe">
                {item.product.images[0] ? <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" /> : null}
              </div>
              <div>
                <h2 className="font-bold">{item.product.name}</h2>
                <p className="text-sm text-ink/60">{item.product.seller.businessName}</p>
                <p className="mt-2 font-black">{formatMoney(String(item.product.price))}</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={updateCartItem.bind(null, item.id, item.quantity - 1)}>
                  <Button variant="secondary" type="submit">-</Button>
                </form>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <form action={updateCartItem.bind(null, item.id, item.quantity + 1)}>
                  <Button variant="secondary" type="submit">+</Button>
                </form>
              </div>
            </Card>
          ))}
          {!items.length ? <Card className="p-8 text-center text-ink/65">Your cart is empty.</Card> : null}
        </div>
        <Card className="h-fit p-5">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-veld">Summary</p>
          <div className="mt-4 flex justify-between text-lg">
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <p className="mt-2 text-sm text-ink/60">Delivery is calculated at checkout based on destination country.</p>
          <Link href="/checkout" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 py-2 font-bold text-white">
            Checkout
          </Link>
        </Card>
      </div>
    </div>
  );
}

