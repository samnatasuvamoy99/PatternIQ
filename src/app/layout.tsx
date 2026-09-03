import "./globals.css";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "PatternIQ — Master DSA Patterns for Technical Interviews",
  description: "Learn Data Structures and Algorithms systematically by pattern, intuition, code templates, and automated spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("font-sans scroll-smooth", inter.variable, plusJakarta.variable, jetbrainsMono.variable)}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased flex flex-col selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
