import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import NavigationBar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'LMS Platform - Professional Learning Management System',
  description: 'Enterprise-grade learning platform powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" />
      </head>
      <body suppressHydrationWarning>
        <NavigationBar />
        <main>{children}</main>
        <Footer />
        <ClientLayout />
      </body>
    </html>
  );
}