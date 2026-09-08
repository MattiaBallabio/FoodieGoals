import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'FoodieGoals — Find your next bite.',
  icons: { icon: '/favicon.svg' },
  description: 'Find fast-food and fast-casual meals that fit your meal goals.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
