import "./globals.css";
import { Noto_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMonoHeading = JetBrains_Mono({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", notoSans.variable, jetbrainsMonoHeading.variable)}>
      <body>{children}</body>
    </html>
  );
}
