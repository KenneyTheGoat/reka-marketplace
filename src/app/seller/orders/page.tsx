import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/actions";
import { formatMoney, toNumber } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { inputClass } from "@/components/ui/Fields";

const fulfilmentStatuses = ["SellerConfirmed", "Packed", "CollectedByCourier", "InTransit", "Delivered"];

export default async function SellerOrdersPage() {
  const session = await auth();
  const seller = await prisma.sellerProfile.findUnique({ where: { userId: session!.user.id } });
  const orders = await prisma.order.findMany({
    where: { items: { some: { sellerId: seller!.id } } },
    include: { items: { where: { sellerId: seller!.id } }, customer: true, delivery: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle title="Seller orders" eyebrow="Fulfilment" />
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_240px]">
            <div>
              <h2 className="font-black">{order.orderNumber}</h2>
              <p className="text-sm text-ink/60">{order.customer.email} • {order.status}</p>
              <p className="mt-2 text-sm">{order.items.map((item) => `${item.productName} x ${item.quantity}`).join(", ")}</p>
              <p className="mt-2 font-bold">{formatMoney(String(order.items.reduce((sum, item) => sum + toNumber(item.lineTotal), 0)))}</p>
            </div>
            <form action={async (formData) => {
              "use server";
              await updateOrderStatus(order.id, String(formData.get("status")));
            }} className="grid gap-2">
              <select className={inputClass} name="status" defaultValue={order.status}>
                {fulfilmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Button>Update status</Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
