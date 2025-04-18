"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function DetailsPage() {

    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    const [galleryNextToken, setGalleryNextToken] = useState<string | undefined>(undefined);
    const [galleryHasMore, setGalleryHasMore] = useState<boolean>(true);
    const [imagesPerPage, setImagesPerPage] = useState<number>(50);

    // --- Fetch Gallery Images function ---
    const fetchGalleryImages = useCallback(async (limit: number, newToken?: string) => {
        setGalleryLoading(true);
        setGalleryError(null);
        try {
            const res = await fetch(`/api/images?limit=${limit}${newToken ? `&nextToken=${encodeURIComponent(newToken)}` : ""}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }
            const data: { images: string[]; nextToken?: string; isTruncated?: boolean } = await res.json();

            // setGalleryImages((prevImages) => [...prevImages, ...data.images]);            
            setGalleryImages((prevImages) => data.images);

            setGalleryNextToken(data.nextToken);
            setGalleryHasMore(!!data.nextToken && data.isTruncated !== false);
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        } catch (error: any) {
            console.error("Failed to fetch gallery images:", error);
            setGalleryError(error.message || "An unknown error occurred");
        } finally {
            setGalleryLoading(false);
        }
    }, []);

    // --- Initial Gallery Load ---
    useEffect(() => {
        setGalleryImages([]);
        setGalleryNextToken(undefined);
        setGalleryHasMore(true);
        fetchGalleryImages(imagesPerPage);

    }, [fetchGalleryImages, imagesPerPage]);

    // --- Load More Images ---
    const loadMore = useCallback(() => {
        if (galleryHasMore && !galleryLoading) {
            fetchGalleryImages(imagesPerPage, galleryNextToken);
        }
    }, [imagesPerPage, galleryHasMore, galleryLoading, galleryNextToken, fetchGalleryImages]);

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">

            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold">5972 Images</h1>
            </header>

            {/* Tab Content */}
            <main className="w-full max-w-full">

                <div>
                    {/* Gallery Controls */}
                    <div className="mb-4 flex items-center space-x-4">
                        <div>
                            <label htmlFor="imagesPerPage" className="mr-2 text-sm">
                                Images per page:
                            </label>
                            <select
                                id="imagesPerPage"
                                className="border rounded py-1 px-2 text-sm disabled:opacity-50"
                                value={imagesPerPage}
                                onChange={(e) => {
                                    const value = Number.parseInt(e.target.value, 10);
                                    setImagesPerPage(value);

                                    setGalleryImages([]);
                                    setGalleryNextToken(undefined);
                                    setGalleryHasMore(true);

                                    fetchGalleryImages(value);

                                }}
                            >
                                <option className="text-gray-700" value="10">10</option>
                                <option className="text-gray-700" value="20">20</option>
                                <option className="text-gray-700" value="50">50</option>
                                <option className="text-gray-700" value="100">100</option>
                            </select>

                        </div>
                        {/* Example of page navigation - adjust UI as needed */}
                        {galleryHasMore && (
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={galleryLoading}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                            >
                                {galleryLoading ? "Loading..." : `Next ${imagesPerPage} images`}
                            </button>
                        )}
                    </div>

                    {/* Gallery Loading State */}
                    {galleryLoading && (
                        <p className="text-center italic text-gray-600">
                            Loading gallery...
                        </p>
                    )}
                    {/* Gallery Error State */}
                    {galleryError && (
                        <p className="text-center text-red-600">
                            Error loading gallery: {galleryError}
                        </p>
                    )}
                    {/* Gallery Images Grid */}
                    {!galleryLoading && !galleryError && galleryImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {galleryImages.map((imageUrl) => {
                                const isGif = imageUrl.toLowerCase().endsWith(".gif");
                                return (
                                    <div
                                        key={imageUrl}
                                        className="relative aspect-square overflow-hidden rounded-md shadow-sm group"
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={`Gallery image ${imageUrl.split("/").pop()}`}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                            priority={galleryImages.indexOf(imageUrl) < imagesPerPage}
                                            unoptimized={isGif}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (!galleryLoading && !galleryError && (
                        <p className="text-center text-gray-600">
                            No images found in the gallery.
                        </p>
                    ))}

                </div>

            </main>

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} My Awesome App</p>
            </footer>
        </div>
    );
}