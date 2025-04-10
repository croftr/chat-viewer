"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { HangoutMessage } from "../types";

type ActiveTab = "messages" | "gallery";

export default function DetailsPage() {
    // --- State variables (Messages, Tabs, Gallery) ---
    const [messages, setMessages] = useState<HangoutMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>("gallery");
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
    const [galleryError, setGalleryError] = useState<string | null>(null);
    const [galleryNextToken, setGalleryNextToken] = useState<string | undefined>(undefined);
    const [galleryHasMore, setGalleryHasMore] = useState<boolean>(true);
    const [galleryLimit, setGalleryLimit] = useState<number>(100); // Initial limit
    const [galleryOffset, setGalleryOffset] = useState<number>(0); // Not directly used with nextToken, but could be adapted
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [imagesPerPage] = useState<number>(50); // You can make this configurable too

    // --- fetchMessages function (remains the same) ---
    const fetchMessages = useCallback(async () => {
        // ... (rest of the fetchMessages function)
    }, [loading, streaming]);

    // --- Fetch Gallery Images function ---
    const fetchGalleryImages = useCallback(async (newToken?: string) => {
        setGalleryLoading(true);
        setGalleryError(null);
        try {
            const res = await fetch(`/api/images?limit=${imagesPerPage}${newToken ? `&nextToken=${encodeURIComponent(newToken)}` : ""}`);
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
    }, [imagesPerPage]);

    // --- Initial Gallery Load ---
    useEffect(() => {
        if (activeTab === "gallery") {
            setGalleryImages([]);
            setGalleryNextToken(undefined);
            setGalleryHasMore(true);
            fetchGalleryImages();
        }
    }, [activeTab, fetchGalleryImages]);

    // --- Load More Images ---
    const loadMore = useCallback(() => {
        if (galleryHasMore && !galleryLoading) {
            fetchGalleryImages(galleryNextToken);
        }
    }, [galleryHasMore, galleryLoading, galleryNextToken, fetchGalleryImages]);

    // --- Handle Page Change (Example - you might need to adjust based on UI) ---
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        const newOffset = (newPage - 1) * imagesPerPage;
        setGalleryImages([]);
        setGalleryNextToken(undefined);
        setGalleryHasMore(true);
        // You might need to adapt the fetch to use offset if S3 supported it efficiently (it doesn't)
        // For now, we'll just refetch from the beginning (less efficient for very large galleries)
        fetchGalleryImages();
        // A more efficient approach for large galleries would involve keeping track of all loaded images
        // or using the nextToken consistently.
    }, [imagesPerPage, fetchGalleryImages]);

    // --- getTabClass helper (remains the same) ---
    const getTabClass = (tabName: ActiveTab) => {
        return `py-2 px-4 rounded-t-md font-medium focus:outline-none ${activeTab === tabName
            ? "bg-white border border-gray-300 border-b-0 text-blue-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`;
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold">Image Gallery</h1>
            </header>


            {/* Tab Content */}
            <main className="w-full max-w-full">
                {/* Messages Tab Content */}
                {activeTab === "messages" && (
                    <div className="flex flex-col gap-4 max-w-md w-full">
                        {!loading && !streaming && messages.length === 0 && (
                            <p className="text-center text-gray-600">
                                No messages loaded. Click "Fetch Messages" to start.
                            </p>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className="bg-gray-100 rounded-md p-4 shadow-sm">
                                <p className="text-gray-800">{message.text}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    <span>{message.author ?? "Unknown User"}</span> -{" "}
                                    <span>
                                        {new Date(message.created_date).toLocaleTimeString()} on{" "}
                                        {new Date(message.created_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {!loading && !streaming && messages.length > 0 && (
                            <p className="text-center italic text-sm text-gray-500 mt-4">
                                Message stream complete.
                            </p>
                        )}
                        {streaming && messages.length > 0 && (
                            <p className="text-center italic text-sm text-gray-500 mt-4">
                                Streaming more messages...
                            </p>
                        )}
                    </div>
                )}

                {/* Gallery Tab Content */}
                {activeTab === "gallery" && (
                    <div>
                        {/* Gallery Controls */}
                        <div className="mb-4 flex items-center space-x-4">
                            <div>
                                <label htmlFor="imagesPerPage" className="mr-2 text-sm">
                                    Images per page:
                                </label>
                                <select
                                    id="imagesPerPage"
                                    disabled={true}
                                    className="border rounded py-1 px-2 text-sm disabled:opacity-50"
                                    value={imagesPerPage}
                                    onChange={(e) => {
                                        const newLimit = Number.parseInt(e.target.value, 10);

                                        if (!Number.isNaN(newLimit) && newLimit > 0) {
                                            setGalleryLimit(newLimit);
                                            setGalleryImages([]);
                                            setGalleryNextToken(undefined);
                                            setGalleryHasMore(true);
                                            // Ideally, you'd reset the page to 1 here
                                            setCurrentPage(1);
                                            //TODO PASS IN newLimit TO THIS
                                            fetchGalleryImages();
                                        }
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
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
                                    {galleryLoading ? "Loading..." : `Get next ${imagesPerPage} images`}
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
                )}
            </main>

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} My Awesome App</p>
            </footer>
        </div>
    );
}