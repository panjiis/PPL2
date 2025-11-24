import type { Metadata } from "next";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SessionProvider } from "@/lib/context/session";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { I18nProvider } from '@/components/i18n-provider';

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const spaceMono = Geist_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ezel Carwash Cilodong - Managerial",
  description: "Powered by SYNTRA™",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubik.variable} ${spaceMono.variable} antialiased`}
      >
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <ThemeSwitcher className="absolute top-4 right-4 z-100" />
              <Toaster position="top-center" />
              <SessionProvider>
                <div className="flex h-screen">
                  <SidebarWrapper>
                    {children}
                  </SidebarWrapper>
                </div>
              </SessionProvider>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
