import Link from "next/link";
import { ArrowRight, Globe2, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Metric } from "@/components/Header";

export default async function HomePage() {
  const [products, sellerCount, orderCount] = await Promise.all([
    prisma.product.findMany({
      where: { status: "APPROVED" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { category: true, seller: true, images: true }
    }),
    prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
    prisma.order.count()
  ]);

  return (
    <div>
      <section className="border-b border-ink/10 bg-[linear-gradient(135deg,#f5f7f3_0%,#d8e8cd_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-veld">Southern African commerce</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] text-ink md:text-7xl">Africa's Marketplace</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Verified sellers, customer-friendly checkout, and order tracking built for South Africa first with a clear path to regional delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-3 font-bold text-white">
                Shop products <ArrowRight size={18} />
              </Link>
              <Link href="/seller/apply" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-3 font-bold">
                Apply to sell
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-4">
            <div className="rounded-lg bg-white p-5 shadow-soft">
              <div className="grid grid-cols-3 gap-3">
                <Metric label="Approved sellers" value={String(sellerCount)} icon={<ShieldCheck size={18} />} />
                <Metric label="Orders processed" value={String(orderCount)} icon={<Truck size={18} />} />
                <Metric label="Countries planned" value="8" icon={<Globe2 size={18} />} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-veld">Fresh approvals</p>
            <h2 className="text-3xl font-black">Latest products</h2>
          </div>
          <Link href="/products" className="font-bold text-veld">View all</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}

