import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trợ Lý Pháp Lý - Nền tảng hỗ trợ pháp lý thông minh",
  description: "Hỏi đáp pháp luật, tra cứu văn bản, thủ tục hành chính và các ứng dụng AI vui nhộn. Powered by Gemini AI.",
  keywords: ["pháp luật", "luật sư", "tư vấn pháp lý", "văn bản pháp luật", "thủ tục hành chính", "AI", "Gemini"],
  authors: [{ name: "TroLyPhapLy Team" }],
  creator: "TroLyPhapLy",
  publisher: "TroLyPhapLy",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://trolyphaply.vn",
    title: "Trợ Lý Pháp Lý - Nền tảng hỗ trợ pháp lý thông minh",
    description: "Hỏi đáp pháp luật, tra cứu văn bản, thủ tục hành chính và các ứng dụng AI vui nhộn.",
    siteName: "TroLyPhapLy",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Trợ Lý Pháp Lý",
    description: "Nền tảng hỗ trợ pháp lý thông minh với AI",
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  
  // PWA
  manifest: "/manifest.json",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0B3B70",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TroLyPhapLy" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                  (registration) => {
                    console.log('ServiceWorker registered:', registration.scope);
                  },
                  (error) => {
                    console.error('ServiceWorker registration failed:', error);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
