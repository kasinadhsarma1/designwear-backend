import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
    title: 'DesignWear Platform',
    description: 'Management hub and API for DesignWear',
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
