import { AlertTriangle, PackageCheck, ShoppingCart, Store } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney, toNumber } from "@/lib/money";
import { Metric } from "@/components/Header";
import { SectionTitle } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const [sellers, pendingProducts, orders, disputes, paidOrders] = await Promise.all([
    prisma.sellerProfile.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.order.count(),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.order.findMany({ where: { status: { notIn: ["PendingPayment", "Cancelled", "Refunded"] } } })
  ]);
  const commission = paidOrders.reduce((sum, order) => sum + toNumber(order.commissionTotal), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Admin dashboard" eyebrow="Operations control" />
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Pending sellers" value={String(sellers)} icon={<Store size={18} />} />
        <Metric label="Products to review" value={String(pendingProducts)} icon={<PackageCheck size={18} />} />
        <Metric label="Orders" value={String(orders)} icon={<ShoppingCart size={18} />} />
        <Metric label="Open disputes" value={String(disputes)} icon={<AlertTriangle size={18} />} />
        <Metric label="Commission earned" value={formatMoney(commission)} />
      </div>
    </div>
  );
}
