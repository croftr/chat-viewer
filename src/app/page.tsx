// app/page.tsx
import Link from 'next/link'; // Import Link for navigation

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] text-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Welcome!</h1>
      </header>

      <main className="flex flex-col items-center gap-6">
        <p className="text-lg text-gray-700">
          This is the homepage of our awesome application.
        </p>
        <p className='text-md text-gray-600'>
            Check out the details page for messages and the image gallery.
        </p>
        {/* Optional: Add a link to the new details page */}
        <Link
          href="/details"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
        >
          Go to Details
        </Link>
      </main>

      <footer className="mt-auto pt-10 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} My Awesome App</p>
      </footer>
    </div>
  );
}