import { Inter } from 'next/font/google';
import './globals.css';
import RootClientLayout from '../components/RootClientLayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans}`}>
      <head>
        <title>AC Control App</title>
      </head>
      <body suppressHydrationWarning={true}>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
