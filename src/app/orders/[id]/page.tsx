import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { Card, SectionTitle } from "@/components/ui/Card";

const statuses = ["PendingPayment", "Paid", "SellerConfirmed", "Packed", "CollectedByCourier", "InTransit", "Delivered"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params;
  const session = await auth();
  const order = await prisma.order.findFirst({
    where: { id: routeParams.id, customerId: session!.user.id },
    include: { items: true, payment: true, delivery: true, address: { include: { country: true } } }
  });
  if (!order) notFound();
  const current = statuses.indexOf(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionTitle title={order.orderNumber} eyebrow="Order details" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-black">Tracking</h2>
          <div className="grid gap-3">
            {statuses.map((status, index) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${index <= current ? "bg-veld" : "bg-ink/15"}`} />
                <span className={index <= current ? "font-bold" : "text-ink/55"}>{status}</span>
              </div>
            ))}
          </div>
          <h2 className="mb-4 mt-8 text-xl font-black">Items</h2>
          <div className="grid gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-t border-ink/10 pt-3">
                <span>{item.productName} × {item.quantity}</span>
                <strong>{formatMoney(String(item.lineTotal))}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card className="h-fit p-5">
          <p className="font-black">{formatMoney(String(order.total))}</p>
          <p className="mt-2 text-sm text-ink/60">Payment: {order.payment?.status ?? "Pending"}</p>
          <p className="mt-2 text-sm text-ink/60">Tracking: {order.delivery?.trackingNumber ?? "Not assigned"}</p>
          <p className="mt-4 text-sm">{order.address.line1}, {order.address.city}, {order.address.country.name}</p>
        </Card>
      </div>
    </div>
  );
}
