import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import HashScrollHandler from "@/components/layout/HashScrollHandler";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";

export const metadata: Metadata = {
  title: "Sigma Scripts | Premium Game Scripts",
  description: "Sigma Scripts provides premium undetected game scripts with lightning-fast delivery, advanced protection, and instant access for serious players.",
  icons: {
    icon: "/logos/logo.png",
    shortcut: "/logos/logo.png",
    apple: "/logos/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" as="video" href="/visuals/animation.mp4" type="video/mp4" />
        {/* OVG Payments domain verification — inline so it runs on first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var i=new Image();i.src="https://billing.ovgcpayments.com/backend/api/vpx?t=b1d3fc562a5735de1b15adcf3a6e8b50e357615c&d="+encodeURIComponent(location.hostname)+"&r="+Date.now();})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-white min-h-screen flex flex-col relative">
        <ParticleBackground />
        {/* Background Effects */}
        <div className="fixed inset-0 z-[-1] bg-noise"></div>
        <div className="fixed inset-0 z-[-3] bg-gradient-dark"></div>
        
        <AuthSessionProvider>
          <SmoothScroll>
            <HashScrollHandler />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </SmoothScroll>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
