import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });
const notoSansBengali = Noto_Sans_Bengali({ 
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-noto-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Patient Portal - Healthcare Access Made Easy",
  description: "Access your prescriptions, book appointments, and manage your health records",
  manifest: "/manifest.json",
  themeColor: "#0891B2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Patient Portal",
  },
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} ${notoSansBengali.className}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#111827',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
