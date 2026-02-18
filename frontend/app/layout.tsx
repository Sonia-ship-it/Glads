import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Glads Apartment Hotel | Luxury Living",
    description: "Experience luxury living with Glads Apartment Hotel.",
      icons: {
    icon: '/logo.png', 
  },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
