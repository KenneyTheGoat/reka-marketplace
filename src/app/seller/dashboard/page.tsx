import { Package, ShoppingBag, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, toNumber } from "@/lib/money";
import { Metric } from "@/components/Header";
import { SectionTitle } from "@/components/ui/Card";

export default async function SellerDashboardPage() {
  const session = await auth();
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: session!.user.id } });
  const [products, orderItems] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller!.id } }),
    prisma.orderItem.findMany({ where: { sellerId: seller!.id } })
  ]);
  const revenue = orderItems.reduce((sum, item) => sum + toNumber(item.lineTotal), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Seller dashboard" eyebrow={seller!.businessName} />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Products listed" value={String(products)} icon={<Package size={18} />} />
        <Metric label="Items sold" value={String(orderItems.reduce((sum, item) => sum + item.quantity, 0))} icon={<ShoppingBag size={18} />} />
        <Metric label="Gross sales" value={formatMoney(revenue)} icon={<Wallet size={18} />} />
      </div>
    </div>
  );
}
