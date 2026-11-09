import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Sukhothai Festival | Interactive Map 2569', description: 'Interactive visitor map for Sukhothai Loy Krathong Festival 2026' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
