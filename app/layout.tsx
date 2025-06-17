import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { WidgetPreferencesProvider } from "./contexts/WidgetPreferencesContext";
import { ActivityLogProvider } from "./contexts/ActivityLogContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ClerkProvider } from '@clerk/nextjs'
import NavBar from "./components/NavBar";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from 'react-hot-toast';
import ScrollRestorationWrapper from "./components/ScrollRestorationWrapper";
import ClientConditionalNavBar from "./components/ClientConditionalNavBar";
import ResponsiveWrapper from "./components/ResponsiveWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Hub",
  applicationName: "Family Hub",
  appleWebApp: {
    title: "Family Hub",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  description: "Your family's digital hub for planning and organization",
  manifest: '/favicon/site_v5.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon_v5.ico' },
      { url: '/favicon/favicon-16x16_v5.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32_v5.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon_v5.png',
    other: [
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-192x192_v5.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-512x512_v5.png',
        sizes: '512x512',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <UserPreferencesProvider>
            <WidgetPreferencesProvider>
              <ThemeProvider>
                <ResponsiveWrapper>
                  <ActivityLogProvider>
                    <LoadingProvider>
                      <ScrollRestorationWrapper>
                        <ClientConditionalNavBar />
                        {children}
                        <LoadingSpinner />
                        <Toaster 
                          position="top-center"
                          containerStyle={{
                            top: '65px', // Push below the nav bar
                          }}
                          toastOptions={{
                            duration: 5000,
                            style: {
                              background: '#334155', // slate-700
                              color: '#f8fafc', // slate-50
                              border: '1px solid #475569', // slate-600
                            },
                            error: {
                              style: {
                                background: '#991b1b', // red-800
                                color: '#fca5a5', // red-400
                                border: '1px solid #b91c1c', // red-700
                              },
                            },
                          }}
                        />
                      </ScrollRestorationWrapper>
                    </LoadingProvider>
                  </ActivityLogProvider>
                </ResponsiveWrapper>
              </ThemeProvider>
            </WidgetPreferencesProvider>
          </UserPreferencesProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
