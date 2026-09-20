import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multi-Warehouse Inventory & Finance Manager',
  description: 'Multi-warehouse inventory, sales, and financial management dashboard tailored for e-commerce sellers with Noon FBN integration, stock transfers, and financial ledgers.',
  openGraph: {
    title: 'Multi-Warehouse Inventory & Finance Manager',
    description: 'Multi-warehouse inventory, sales, and financial management dashboard tailored for e-commerce sellers with Noon FBN integration, stock transfers, and financial ledgers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
