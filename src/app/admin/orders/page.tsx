import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true, payment: true, delivery: true, disputes: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Orders" eyebrow="Admin" />
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="grid gap-3 p-5 md:grid-cols-[1fr_auto_auto]">
              <div>
                <h2 className="font-black">{order.orderNumber}</h2>
                <p className="text-sm text-ink/60">{order.customer.email} • {order.status} • {order.payment?.provider ?? "No payment"}</p>
              </div>
              <span className="text-sm font-bold">{order.disputes.length} dispute(s)</span>
              <strong>{formatMoney(String(order.total))}</strong>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

