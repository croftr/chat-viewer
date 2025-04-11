import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { FaHome } from "react-icons/fa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat viewer",
  description: "Chat viewer for the Pork Flumps and🐿️chops community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed bottom-2 left-1">
          <Link
            href="/"
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
          >
            <FaHome className="inline" />
          </Link>
        </div>

        {children}
      </body>
    </html>
  );
}
