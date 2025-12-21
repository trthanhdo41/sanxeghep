import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { ChatBot } from "@/components/ChatBot";
import { AuthProvider } from "@/lib/auth-context";
import { SessionExpiredHandler } from "@/components/SessionExpiredHandler";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sanxeghep.vn'),
  title: {
    default: "SanXeGhep - Xe Ghép Toàn Quốc | Tiết Kiệm Chi Phí Di Chuyển",
    template: "%s | SanXeGhep"
  },
  description: "Nền tảng kết nối xe ghép (carpooling) hàng đầu Việt Nam. Tìm chuyến xe ghép, đăng chuyến đi, chia sẻ chi phí xăng. An toàn, tiện lợi, tiết kiệm đến 50%. Hơn 12.000 chuyến/tháng, 2.500+ tài xế uy tín.",
  keywords: [
    "xe ghép",
    "xe ghép toàn quốc", 
    "xe tiện chuyến",
    "carpooling việt nam",
    "đi chung xe",
    "tìm xe ghép",
    "đăng chuyến xe",
    "chia sẻ xe",
    "xe đi tỉnh",
    "xe ghép hà nội",
    "xe ghép sài gòn",
    "tiết kiệm chi phí đi lại",
    "san xe ghep",
    "sanxeghep"
  ],
  authors: [{ name: "SanXeGhep" }],
  creator: "SanXeGhep",
  publisher: "SanXeGhep",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://sanxeghep.vn",
    siteName: "SanXeGhep",
    title: "SanXeGhep - Xe Ghép Toàn Quốc | Tiết Kiệm Chi Phí Di Chuyển",
    description: "Nền tảng kết nối xe ghép hàng đầu Việt Nam. Tìm chuyến xe, đăng chuyến đi, chia sẻ chi phí. An toàn, tiện lợi, tiết kiệm đến 50%.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SanXeGhep - Xe Ghép Toàn Quốc",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SanXeGhep - Xe Ghép Toàn Quốc",
    description: "Nền tảng kết nối xe ghép hàng đầu Việt Nam. Tiết kiệm chi phí, an toàn, tiện lợi.",
    images: ["/logo.png"],
    creator: "@sanxeghep",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // TODO: Add real verification code
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "https://sanxeghep.vn",
  },
  category: "transportation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SanXeGhep',
    url: 'https://sanxeghep.vn',
    description: 'Nền tảng kết nối xe ghép toàn quốc',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sanxeghep.vn/tim-chuyen?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SanXeGhep',
    url: 'https://sanxeghep.vn',
    logo: 'https://sanxeghep.vn/logo.png',
    description: 'Nền tảng kết nối xe ghép hàng đầu Việt Nam',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-1900-xxxx',
      contactType: 'customer service',
      areaServed: 'VN',
      availableLanguage: 'Vietnamese',
    },
    sameAs: [
      'https://facebook.com/sanxeghep',
      'https://instagram.com/sanxeghep',
    ],
  }

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <BackToTop />
          <ChatBot />
          <SessionExpiredHandler />
          <Toaster 
            position="bottom-right" 
            richColors 
            closeButton
            expand={true}
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#1a1a1a',
                border: '1px solid #e5e5e5',
                fontSize: '14px',
                fontWeight: '500',
              },
              className: 'shadow-lg',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
