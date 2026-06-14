import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "REKA | Powered by BPG Software",
  description: "A Southern African marketplace for verified sellers and cross-border-ready commerce."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
