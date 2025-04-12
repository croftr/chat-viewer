import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { FaHome, FaImage, FaEnvelope, FaChartBar } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";

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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="pb-16"> {/* Add padding to the bottom to prevent content overlap */}
          {children}
        </div>
        <nav className="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-800 py-2 flex justify-around items-center border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 sm:px-6 pl-4 pr-4"
          >
            <FaHome className="inline sm:hidden" />
            <span className="hidden sm:inline">
              <FaHome className="inline mr-2 mb-1" />
              Home
            </span>
          </Link>
          <Link
            href="/gallery"
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 sm:px-6 pl-4 pr-4"
          >
            <FaImage className="inline sm:hidden" />
            <span className="hidden sm:inline">
              <FaImage className="inline mr-2 mb-1" />
              Gallery
            </span>
          </Link>
          <Link
            href="/messages"
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 sm:px-6 pl-4 pr-4"
          >
            <FaEnvelope className="inline sm:hidden" />
            <span className="hidden sm:inline">
              <FaMessage className="inline mr-2 mb-1" />
              Messages
            </span>
          </Link>
          <Link
            href="/stats"
            className="p-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 sm:px-6 pl-4 pr-4"
          >
            <FaChartBar className="inline sm:hidden" />
            <span className="hidden sm:inline">
              <FaChartBar className="inline mr-2 mb-1" />
              Stats
            </span>
          </Link>
        </nav>
      </body>
    </html>
  );
}