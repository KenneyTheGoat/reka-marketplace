import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const countries = [
    ["ZA", "South Africa", "ZAR"],
    ["ZW", "Zimbabwe", "USD"],
    ["BW", "Botswana", "BWP"],
    ["NA", "Namibia", "NAD"],
    ["ZM", "Zambia", "ZMW"],
    ["MZ", "Mozambique", "MZN"],
    ["LS", "Lesotho", "LSL"],
    ["SZ", "Eswatini", "SZL"]
  ] as const;

  for (const [code, name, currency] of countries) {
    await prisma.country.upsert({
      where: { code },
      update: { name, currency, isActive: true },
      create: { code, name, currency, isActive: true }
    });
  }

  const categorySeed = [
    ["Electronics", "electronics"],
    ["Fashion", "fashion"],
    ["Home & Living", "home-living"],
    ["Beauty", "beauty"],
    ["Food & Pantry", "food-pantry"]
  ] as const;

  const categories = new Map<string, string>();
  for (const [name, slug] of categorySeed) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
    categories.set(slug, category.id);
  }

  const passwordHash = await hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bpgmarketplace.co.za" },
    update: { role: "ADMIN", passwordHash },
    create: { name: "Admin User", email: "admin@bpgmarketplace.co.za", role: "ADMIN", passwordHash, cart: { create: {} } }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash },
    create: { name: "Naledi Mokoena", email: "customer@example.com", passwordHash, cart: { create: {} } }
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: { role: "SELLER", passwordHash },
    create: { name: "Thabo Seller", email: "seller@example.com", role: "SELLER", passwordHash, cart: { create: {} } }
  });

  await prisma.user.upsert({
    where: { email: "pending-seller@example.com" },
    update: { passwordHash },
    create: { name: "Pending Seller", email: "pending-seller@example.com", passwordHash, cart: { create: {} } }
  });

  const seller = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser.id },
    update: { status: "APPROVED" },
    create: {
      userId: sellerUser.id,
      businessName: "Cape Trade Co.",
      description: "Curated South African lifestyle goods ready for regional delivery.",
      countryCode: "ZA",
      status: "APPROVED"
    }
  });

  const pendingUser = await prisma.user.findUniqueOrThrow({ where: { email: "pending-seller@example.com" } });
  await prisma.sellerProfile.upsert({
    where: { userId: pendingUser.id },
    update: { status: "PENDING" },
    create: {
      userId: pendingUser.id,
      businessName: "Lusaka Home Supply",
      description: "Household products supplier applying for cross-border marketplace access.",
      countryCode: "ZM",
      status: "PENDING"
    }
  });

  const productData = [
    {
      name: "Solar Rechargeable Lantern",
      slug: "solar-rechargeable-lantern",
      category: "electronics",
      price: 389.99,
      stock: 45,
      description: "Portable LED lantern with USB charging, built for load shedding and rural travel.",
      imageUrl: "https://images.unsplash.com/photo-1509390144018-eeaf65052242?auto=format&fit=crop&w=1200&q=80",
      countries: ["ZA", "LS", "SZ", "BW", "NA"]
    },
    {
      name: "Handwoven Shopper Basket",
      slug: "handwoven-shopper-basket",
      category: "home-living",
      price: 249.0,
      stock: 30,
      description: "Durable woven basket suitable for groceries, storage, and weekend markets.",
      imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80",
      countries: ["ZA", "ZW", "BW", "NA", "LS", "SZ"]
    },
    {
      name: "Rooibos Pantry Bundle",
      slug: "rooibos-pantry-bundle",
      category: "food-pantry",
      price: 179.5,
      stock: 80,
      description: "A pantry bundle with rooibos tea, rusks, and locally sourced preserves.",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80",
      countries: ["ZA", "BW", "NA"]
    },
    {
      name: "Linen Summer Shirt",
      slug: "linen-summer-shirt",
      category: "fashion",
      price: 459.0,
      stock: 22,
      description: "Breathable linen shirt with a clean casual fit for warm Southern African summers.",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
      countries: ["ZA", "MZ", "ZW", "BW"]
    }
  ];

  const products = [];
  for (const item of productData) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: { stock: item.stock, status: "APPROVED" },
      create: {
        sellerId: seller.id,
        categoryId: categories.get(item.category)!,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        stock: item.stock,
        deliveryNotes: "Seller packs orders within 2 business days. Courier integration is mocked for MVP.",
        status: "APPROVED",
        images: { create: { url: item.imageUrl, alt: item.name } },
        availability: { create: item.countries.map((countryCode) => ({ countryCode })) }
      }
    });
    products.push(product);
  }

  const pendingProductSlug = "premium-haircare-kit";
  await prisma.product.upsert({
    where: { slug: pendingProductSlug },
    update: { status: "PENDING_APPROVAL" },
    create: {
      sellerId: seller.id,
      categoryId: categories.get("beauty")!,
      name: "Premium Haircare Kit",
      slug: pendingProductSlug,
      description: "Hydrating care kit submitted for marketplace quality review.",
      price: 329.0,
      stock: 18,
      deliveryNotes: "Packed by seller; courier partner placeholder applies.",
      status: "PENDING_APPROVAL",
      images: { create: { url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80", alt: "Premium Haircare Kit" } },
      availability: { create: [{ countryCode: "ZA" }, { countryCode: "LS" }] }
    }
  });

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      line1: "12 Market Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2001",
      countryCode: "ZA"
    }
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: `REKA-SEED-${Date.now()}`,
      customerId: customer.id,
      addressId: address.id,
      status: "InTransit",
      subtotal: 389.99,
      deliveryFee: 85,
      commissionTotal: 39,
      total: 474.99,
      items: {
        create: {
          productId: products[0].id,
          sellerId: seller.id,
          productName: products[0].name,
          quantity: 1,
          unitPrice: 389.99,
          lineTotal: 389.99
        }
      },
      payment: {
        create: {
          provider: "MOCK",
          status: "CONFIRMED",
          amount: 474.99,
          reference: `MOCK-SEED-${Date.now()}`,
          confirmedAt: new Date()
        }
      },
      delivery: {
        create: {
          destinationCountry: "ZA",
          trackingNumber: "BPG-102938",
          notes: "Courier partner placeholder.",
          status: "InTransit"
        }
      }
    }
  });

  await prisma.dispute.create({
    data: {
      orderId: order.id,
      userId: customer.id,
      reason: "Customer requested admin review of delivery timing.",
      status: "UNDER_REVIEW"
    }
  });

  await prisma.review.create({
    data: {
      productId: products[1].id,
      userId: customer.id,
      rating: 5,
      comment: "Great quality and arrived well packed."
    }
  });

  console.log({
    admin: admin.email,
    seller: sellerUser.email,
    customer: customer.email,
    password: "password123"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

