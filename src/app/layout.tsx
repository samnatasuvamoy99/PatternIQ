import "./globals.css";
import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const jetbrainsMonoHeading = JetBrains_Mono({ subsets: ["latin"], variable: "--font-heading" });
const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "PatternIQ — Master DSA Patterns for Technical Interviews",
  description: "Learn Data Structures and Algorithms systematically by pattern, intuition, code templates, and automated spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans scroll-smooth", notoSans.variable, jetbrainsMonoHeading.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
