"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="mt-3 text-ink/65">The marketplace could not complete that request. Try again or check the server logs.</p>
        <Button className="mt-6" onClick={reset}><RotateCcw size={18} /> Retry</Button>
      </div>
    </div>
  );
}

