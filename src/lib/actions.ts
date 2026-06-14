"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { signIn, signOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/money";

const passwordSchema = z.string().min(8, "Use at least 8 characters.");

export async function registerCustomer(_: unknown, formData: FormData) {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: passwordSchema
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) return { error: "Enter a valid name, email, and password." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account already exists for this email." };

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hash(parsed.data.password, 12),
      cart: { create: {} }
    }
  });

  await signIn("credentials", { email, password: parsed.data.password, redirectTo: "/" });
}

export async function login(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: String(formData.get("callbackUrl") || "/")
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function applyToSell(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = z
    .object({
      businessName: z.string().min(2),
      description: z.string().min(20),
      countryCode: z.string().min(2).max(2)
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please complete all seller application fields." };

  await prisma.sellerProfile.upsert({
    where: { userId: session.user.id },
    update: { ...parsed.data, status: "PENDING" },
    create: { ...parsed.data, userId: session.user.id }
  });
  revalidatePath("/seller/apply");
  return { success: "Application submitted for admin review." };
}

export async function createProduct(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user || !["SELLER", "ADMIN"].includes(session.user.role)) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } });
  if (!seller || seller.status !== "APPROVED") return { error: "Your seller account must be approved first." };

  const parsed = z
    .object({
      name: z.string().min(3),
      description: z.string().min(20),
      categoryId: z.string().min(1),
      price: z.coerce.number().positive(),
      stock: z.coerce.number().int().nonnegative(),
      deliveryNotes: z.string().min(5),
      imageUrl: z.string().url(),
      countries: z.string().min(2)
    })
    .safeParse({
      ...Object.fromEntries(formData),
      countries: formData.getAll("countries").join(",")
    });

  if (!parsed.success) return { error: "Check product details, price, stock, image URL, and country availability." };

  const slug = `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
  await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      deliveryNotes: parsed.data.deliveryNotes,
      status: "PENDING_APPROVAL",
      images: { create: { url: parsed.data.imageUrl, alt: parsed.data.name } },
      availability: {
        create: parsed.data.countries.split(",").map((countryCode) => ({ countryCode }))
      }
    }
  });
  revalidatePath("/seller/products");
  return { success: "Product submitted for admin approval." };
}

export async function addToCart(productId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "APPROVED" || product.stock < 1) redirect("/products");

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id }
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: 1 } },
    create: { cartId: cart.id, productId, quantity: 1 }
  });
  revalidatePath("/cart");
}

export async function updateCartItem(itemId: string, quantity: number) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  revalidatePath("/cart");
}

export async function checkout(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = z
    .object({
      label: z.string().default("Delivery"),
      line1: z.string().min(4),
      line2: z.string().optional(),
      city: z.string().min(2),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      countryCode: z.string().min(2).max(2)
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/checkout?error=address");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: { include: { seller: true } } } } }
  });
  if (!cart?.items.length) redirect("/checkout?error=empty");

  const unavailable = cart.items.find((item) => item.product.stock < item.quantity || item.product.status !== "APPROVED");
  if (unavailable) redirect("/checkout?error=stock");

  const subtotal = cart.items.reduce((sum, item) => sum + toNumber(item.product.price) * item.quantity, 0);
  const deliveryFee = parsed.data.countryCode === "ZA" ? 85 : 240;
  const commissionTotal = subtotal * 0.1;
  const total = subtotal + deliveryFee;

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({ data: { ...parsed.data, userId: session.user.id } });
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: `REKA-${Date.now()}`,
        customerId: session.user.id,
        addressId: address.id,
        subtotal,
        deliveryFee,
        commissionTotal,
        total,
        status: "Paid",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            sellerId: item.product.sellerId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            lineTotal: toNumber(item.product.price) * item.quantity
          }))
        },
        payment: {
          create: {
            amount: total,
            provider: "MOCK",
            status: "CONFIRMED",
            reference: `MOCK-${Date.now()}`,
            confirmedAt: new Date()
          }
        },
        delivery: {
          create: {
            destinationCountry: parsed.data.countryCode,
            trackingNumber: `BPG-${Math.floor(Math.random() * 900000 + 100000)}`,
            notes: "Courier partner integration placeholder."
          }
        }
      }
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return createdOrder;
  });

  redirect(`/orders/${order.id}`);
}

export async function updateSellerStatus(sellerId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: {
      status,
      user: status === "APPROVED" ? { update: { role: "SELLER" } } : undefined
    }
  });
  revalidatePath("/admin/sellers");
}

export async function updateProductStatus(productId: string, status: "APPROVED" | "REJECTED" | "ARCHIVED") {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session?.user || !["SELLER", "ADMIN"].includes(session.user.role)) redirect("/");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as never,
      delivery: { update: { status: status as never } }
    }
  });
  revalidatePath("/seller/orders");
  revalidatePath("/admin/orders");
}
