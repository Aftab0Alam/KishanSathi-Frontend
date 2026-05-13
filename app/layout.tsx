import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "KisanSathi — Smart AI Assistant for Modern Farming",
  description: "AI-powered crop intelligence, disease detection, fertilizer recommendations, weather forecasting, and smart farming automation for modern Indian farmers.",
  keywords: "AI farming, crop disease detection, fertilizer recommendation, smart agriculture, KisanSathi, Indian farmers, precision farming",
  authors: [{ name: "KisanSathi" }],
  creator: "KisanSathi",
  publisher: "KisanSathi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KisanSathi",
  },
  openGraph: {
    title: "KisanSathi — Smart AI Farming Assistant",
    description: "Transform your farming with AI-powered crop intelligence and smart recommendations.",
    type: "website",
    locale: "hi_IN",
    siteName: "KisanSathi",
  },
  twitter: {
    card: "summary_large_image",
    title: "KisanSathi",
    description: "Smart AI Assistant for Modern Farming",
  },
};

export const viewport: Viewport = {
  themeColor: "#4ADE80",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="dark">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#050816" />
      </head>
      <body className="animated-bg">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
