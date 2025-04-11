// app/page.tsx
'use client'; // Ensure this is a client component for dark mode toggle (if needed)

import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa'; // Import a user icon from react-icons
import { useState, useEffect } from 'react'; // Import for dark mode state (optional)
import Image from "next/image";

// Import the metadata object you created
import { messageMetadata } from './constants';

const images: Record<string, string> = {
  "Gary Morris": "/gary.png",
  "Rob Croft": "/rob.jpg",
  "Mikey": "/mikey.jpg",
  "Nicholas Barooah": "/nick.jpg",
}
export default function Home() {
  const authors = Object.keys(messageMetadata.messagesByAuthor) as Array<keyof typeof messageMetadata.messagesByAuthor>;
  const monthlyData = messageMetadata.messagesByMonthAndYear;

  // Structure the monthly data for better display
  const monthlyBreakdown = Object.entries(monthlyData)
    .sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])) // Sort by year ascending
    .map(([year, months]) => {
      const totalYearlyCount = Object.values(months).reduce((sum, count) => sum + count, 0); // Calculate total for the year
      return {
        year: year,
        total: totalYearlyCount, // Add total count for the year
        months: Object.entries(months)
          .sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0])) // Sort by month ascending
          .map(([month, count]) => ({
            month: new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' }),
            count: count,
          })),
      };
    });

  // Dark mode state (optional, for client-side control)
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference on mount (optional)
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-6 flex flex-col items-center justify-center transition-colors duration-300">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col items-center justify-center">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Pork Flumps and🐿️chops</h1>
        </header>

        <main className="flex flex-col items-center gap-8 w-full max-w-3xl">
          <div className="flex gap-4">
            <Link
              href="/gallery"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
            >
              Gallery
            </Link>

            <Link
              href="/messages"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
            >
              Messages
            </Link>
          </div>

          <section className="w-full rounded-md shadow-md p-6 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Members (Past and Present)</h2>
            <div className="grid grid-cols-1 gap-4">
              {authors.map((author) => {
                const bio = messageMetadata.bioByAuthor[author];
                return (
                  <div key={author} className="flex flex-col items-center border rounded-md p-4 border-gray-200 dark:border-gray-700 w-full">

                    <div className="flex justify-start w-full gap-4">
                      {images[author] && (
                        <Image
                          src={images[author]}
                          alt={author}
                          width={50} // Increased width
                          height={50} // Increased height
                          className="rounded-full mb-2" // Adjust margin for consistency
                        />
                      )}
                      {!images[author] && (
                        <FaUserCircle
                          className="text-6xl text-gray-500 dark:text-gray-400 mb-2" // Adjust size for consistency
                          size={48} // Match the size of the image
                        />
                      )}

                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{author}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">Messages: {messageMetadata.messagesByAuthor[author]}</p>
                      </div>

                    </div>


                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                      {bio?.summary || 'No bio available.'}
                    </p>
                    {bio?.contentThemes?.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Content Themes:</h4>
                        <ul className="list-disc pl-4 text-sm text-gray-600 dark:text-gray-400">
                          {bio.contentThemes.map((theme, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <li key={index}>{theme}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {bio?.style?.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Style:</h4>
                        <ul className="list-disc pl-4 text-sm text-gray-600 dark:text-gray-400">
                          {bio.style.map((style, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <li key={index}>{style}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="w-full rounded-md shadow-md p-6 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Total Messages</h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{messageMetadata.totalMessages}</p>
          </section>

          <section className="w-full rounded-md shadow-md p-6 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Messages Over Time</h2>
            {monthlyBreakdown.map(({ year, total, months }) => (
              <div key={year} className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {year} <span className="text-green-600 dark:text-green-400">({total} messages)</span>
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {months.map(({ month, count }) => (
                    <div key={`${year}-${month}`} className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{month}:</span> {count}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>

      <footer className="mt-auto py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>&copy; {new Date().getFullYear()} Chat viewer</p>
      </footer>
    </div>
  );
}