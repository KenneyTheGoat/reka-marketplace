import { NextResponse } from "next/server";
import { auth } from "@/auth";

const sellerPaths = ["/seller/dashboard", "/seller/products", "/seller/orders"];
const adminPaths = ["/admin"];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  if (!req.auth && [...sellerPaths, ...adminPaths, "/orders", "/cart", "/checkout"].some((p) => path.startsWith(p))) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (sellerPaths.some((p) => path.startsWith(p)) && !["SELLER", "ADMIN"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/seller/apply", req.nextUrl));
  }

  if (adminPaths.some((p) => path.startsWith(p)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/cart/:path*", "/checkout/:path*", "/orders/:path*", "/seller/:path*", "/admin/:path*"]
};

