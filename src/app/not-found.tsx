import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-4 text-center">
      <div>
        <h1 className="text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-ink/65">That marketplace page is unavailable or still waiting for approval.</p>
        <Link href="/products" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-ink px-5 py-3 font-bold text-white">
          Browse products
        </Link>
      </div>
    </div>
  );
}

