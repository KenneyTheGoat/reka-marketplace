import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkout } from "@/lib/actions";
import { formatMoney, toNumber } from "@/lib/money";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/ui/Fields";
import { Button } from "@/components/ui/Button";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const session = await auth();
  const [countries, cart] = await Promise.all([
    prisma.country.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.cart.findUnique({ where: { userId: session!.user.id }, include: { items: { include: { product: true } } } })
  ]);
  const subtotal = cart?.items.reduce((sum, item) => sum + toNumber(item.product.price) * item.quantity, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionTitle title="Checkout" eyebrow="Mock payment" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          {query.error ? (
            <p className="mb-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">
              {query.error === "empty" ? "Your cart is empty." : query.error === "stock" ? "One or more items are unavailable." : "Please check the delivery address."}
            </p>
          ) : null}
          <form action={checkout} className="grid gap-4">
            <Field label="Address label"><input className={inputClass} name="label" defaultValue="Home" /></Field>
            <Field label="Address line 1"><input className={inputClass} name="line1" required /></Field>
            <Field label="Address line 2"><input className={inputClass} name="line2" /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="City"><input className={inputClass} name="city" required /></Field>
              <Field label="Province / region"><input className={inputClass} name="province" /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Postal code"><input className={inputClass} name="postalCode" /></Field>
              <Field label="Delivery country">
                <select className={inputClass} name="countryCode" required>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                </select>
              </Field>
            </div>
            <Button disabled={!cart?.items.length}>Confirm mock payment</Button>
          </form>
        </Card>
        <Card className="h-fit p-5">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-veld">Order estimate</p>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between"><span>Items</span><strong>{cart?.items.length ?? 0}</strong></div>
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="flex justify-between"><span>SA delivery from</span><strong>{formatMoney(85)}</strong></div>
          </div>
          <p className="mt-4 text-sm text-ink/60">PayFast, Yoco, and Ozow can be added behind the same payment record structure.</p>
        </Card>
      </div>
    </div>
  );
}
