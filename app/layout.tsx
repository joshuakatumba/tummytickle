import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
    subsets: ["latin"],
    variable: "--font-work-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Tummy Ticklers - Bakery Accounting",
    description: "Professional accounting system for Tummy Ticklers Bakery",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${workSans.variable} font-sans`}>{children}</body>
        </html>
    );
}
