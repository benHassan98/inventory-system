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
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-100 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
