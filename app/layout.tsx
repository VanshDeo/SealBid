import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { MidnightProvider } from "@/providers/midnight-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} | Confidential Zero-Knowledge Auctions`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-gray-950 text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ThemeProvider>
          <MidnightProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </MidnightProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
