import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

export const metadata: Metadata = {
    title: "Glads Apartment Hotel | Luxury Living",
    description: "Experience luxury living with Glads Apartment Hotel.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${playfair.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
