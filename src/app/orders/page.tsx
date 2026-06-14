import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { Card, SectionTitle } from "@/components/ui/Card";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { customerId: session!.user.id },
    include: { items: true, payment: true, delivery: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionTitle title="Orders" eyebrow="Tracking" />
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link href={`/orders/${order.id}`} key={order.id}>
            <Card className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-black">{order.orderNumber}</h2>
                <p className="text-sm text-ink/60">{order.items.length} item(s) • {order.status}</p>
              </div>
              <strong>{formatMoney(String(order.total))}</strong>
            </Card>
          </Link>
        ))}
        {!orders.length ? <Card className="p-8 text-center text-ink/65">No orders yet.</Card> : null}
      </div>
    </div>
  );
}

