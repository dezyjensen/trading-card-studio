import type { Metadata } from "next";
import { DM_Sans, Syne, Fraunces, JetBrains_Mono } from "next/font/google";
import { ColorModeProvider } from "@/lib/color-mode";
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from "@/lib/brand";
import "./globals.css";

const brand = Syne({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_SLOGAN}`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_SLOGAN,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${brand.variable} ${display.variable} ${body.variable} ${mono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before paint — avoids blank/black flash on mobile */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem("tcs-color-mode");if(m!=="light"&&m!=="dark"){m=window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"}var r=document.documentElement;r.classList.toggle("dark",m==="dark");r.classList.toggle("light",m==="light");r.dataset.theme=m;r.style.colorScheme=m}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ColorModeProvider>{children}</ColorModeProvider>
      </body>
    </html>
  );
}
