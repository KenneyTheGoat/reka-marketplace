import Link from "next/link";
import { PackageOpen, Search, ShieldCheck, Store } from "lucide-react";
import { auth } from "@/auth";
import { logout } from "@/lib/actions";
import { adminLinks, customerLinks, sellerLinks } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";

export async function Header() {
  const session = await auth();
  const links = [
    ...customerLinks,
    ...(session?.user.role === "SELLER" || session?.user.role === "ADMIN" ? sellerLinks : [{ href: "/seller/apply", label: "Sell" }]),
    ...(session?.user.role === "ADMIN" ? adminLinks : [])
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-mist/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-white">
            <PackageOpen size={22} />
          </span>
          <span>
            <span className="block text-lg font-black leading-tight">REKA</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-veld">Powered by BPG Software</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {links.map((link) => (
            <Link key={`${link.href}-${link.label}`} href={link.href} className="rounded-md px-3 py-2 hover:bg-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/products" className="hidden rounded-md border border-ink/10 bg-white p-2 md:inline-flex" aria-label="Search products">
            <Search size={18} />
          </Link>
          {session ? (
            <form action={logout}>
              <Button variant="secondary" type="submit">Sign out</Button>
            </form>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-white">Login</Link>
              <Link href="/register" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-veld px-4 py-2 text-sm font-semibold text-white">
                <ShieldCheck size={18} /> Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-veld">{icon ?? <Store size={18} />}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}

