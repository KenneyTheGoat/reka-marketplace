import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/ui/Card";
import { inputClass } from "@/components/ui/Fields";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const query = await searchParams;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        name: query.q ? { contains: query.q, mode: "insensitive" } : undefined,
        category: query.category ? { slug: query.category } : undefined
      },
      include: { category: true, seller: true, images: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Marketplace" eyebrow="Approved products" />
      <form className="mb-8 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input className={inputClass} name="q" placeholder="Search products" defaultValue={query.q} />
        <select className={inputClass} name="category" defaultValue={query.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <button className="rounded-md bg-ink px-5 py-2 font-bold text-white">Filter</button>
      </form>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {!products.length ? <p className="rounded-lg bg-white p-6 text-ink/65">No approved products match this search.</p> : null}
    </div>
  );
}
