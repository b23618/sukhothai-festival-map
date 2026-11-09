import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'งานประเพณีลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย ปี 2569 | แผนที่ 3 มิติ', description: 'แผนที่ 3 มิติแบบอินเทอร์แอคทีฟของงานประเพณีลอยกระทง เผาเทียน เล่นไฟ จังหวัดสุโขทัย ปี 2569 · Interactive 3D visitor map of the Sukhothai Loy Krathong, Candle-Burning & Fireworks Festival 2026' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
