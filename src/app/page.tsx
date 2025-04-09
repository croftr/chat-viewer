"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// --- Message interface (remains the same) ---
interface Message {
	text: string;
	created_date: string;
	creator: {
		name: string;
	};
}

type ActiveTab = "messages" | "gallery";

export default function Home() {
	// --- Message State (remains the same) ---
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const [streaming, setStreaming] = useState(false);

	// --- Tab State (remains the same) ---
	const [activeTab, setActiveTab] = useState<ActiveTab>("messages");

	// --- Gallery State ---
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
	const [galleryError, setGalleryError] = useState<string | null>(null);

	// --- fetchMessages function (remains the same) ---
	const fetchMessages = useCallback(async () => {
		// ... (keep existing fetchMessages logic)
		try {
			setLoading(true);
			setStreaming(true);
			setMessages([]);

			const response = await fetch("/api/messages", {
				headers: { Accept: "text/event-stream" },
			});

			if (!response.ok) {
				console.error(
					"Failed to fetch SSE stream:",
					response.status,
					response.statusText,
				);
				setLoading(false);
				setStreaming(false);
				return;
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let accumulatedData = "";

			if (!reader) {
				console.error("Could not get reader from response body.");
				setLoading(false);
				setStreaming(false);
				return;
			}

			setActiveTab("messages"); // Switch to messages tab on fetch

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					setStreaming(false);
					break;
				}
				if (value) {
					accumulatedData += decoder.decode(value, { stream: true });
					const lines = accumulatedData.split("\n");
					accumulatedData = lines.pop() || "";
					let messageReceived = false;
					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const jsonDataString = line.substring(6);
							if (jsonDataString.trim()) {
								try {
									const jsonData: Message = JSON.parse(jsonDataString);
									setMessages((prevMessages) => [...prevMessages, jsonData]);
									messageReceived = true;
								} catch (error) {
									console.error(
										"Error parsing JSON data:",
										jsonDataString,
										error,
									);
								}
							}
						}
					}
					if (messageReceived && !loading) setLoading(true);
				}
			}
			setLoading(false); // Set loading false after stream finishes
		} catch (error) {
			console.error("Error fetching messages:", error);
			setLoading(false);
			setStreaming(false);
		}
	}, [loading]); // Dependencies: include loading to ensure proper updates

	// --- Fetch Gallery Images ---
	useEffect(() => {
		// Fetch images when the component mounts
		// Alternatively, you could trigger this fetch only when the gallery tab is first opened
		const fetchGalleryImages = async () => {
			setGalleryLoading(true);
			setGalleryError(null);
			try {
				const response = await fetch("/api/images");
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error || `HTTP error! status: ${response.status}`,
					);
				}
				const data: { images: string[] } = await response.json();
				setGalleryImages(data.images || []); // Ensure it's an array
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				console.error("Failed to fetch gallery images:", error);
				setGalleryError(error.message || "An unknown error occurred");
				setGalleryImages([]); // Clear images on error
			} finally {
				setGalleryLoading(false);
			}
		};

		fetchGalleryImages();
	}, []); // Empty dependency array means this runs once on mount

	// --- getTabClass helper (remains the same) ---
	const getTabClass = (tabName: ActiveTab) => {
		return `py-2 px-4 rounded-t-md font-medium focus:outline-none ${
			activeTab === tabName
				? "bg-white border border-gray-300 border-b-0 text-blue-600"
				: "bg-gray-100 text-gray-600 hover:bg-gray-200"
		}`;
	};

	return (
		<div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
			<header className="text-center mb-6">
				<h1 className="text-2xl font-bold">Chat Stats</h1>
			</header>

			{/* Fetch Messages Button */}
			<div className="mb-6">
				<button
					type="button"
					onClick={fetchMessages}
					disabled={true}
					// disabled={loading && streaming}
					// className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && streaming ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{loading && streaming ? "Fetching Messages..." : "Fetch Messages"}
				</button>
				{loading && !streaming && messages.length === 0 && (
					<p className="text-center italic text-sm mt-2">Connecting...</p>
				)}
			</div>

			{/* Tab Navigation */}
			<div className="w-full max-w-md border-b border-gray-300 mb-6">
				<nav className="flex space-x-1">
					<button
						type="button"
						onClick={() => setActiveTab("messages")}
						className={getTabClass("messages")}
					>
						Messages
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("gallery")}
						className={getTabClass("gallery")}
					>
						Gallery
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			<main className="w-full max-w-md">
				{/* Messages Tab Content */}
				{activeTab === "messages" && (
					<div className="flex flex-col gap-4">
						{/* Message Loading/Streaming Indicators */}
						{loading && streaming && messages.length === 0 && (
							<p className="text-center italic">Streaming messages...</p>
						)}
						{!loading && !streaming && messages.length === 0 && (
							<p className="text-center text-gray-600">
								No messages loaded. Click "Fetch Messages" to start.
							</p>
						)}

						{/* Message List */}
						{messages.map((message, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<div key={index} className="bg-gray-100 rounded-md p-4 shadow-sm">
								{/* ... message content ... */}
								<p className="text-gray-800">{message.text}</p>
								<div className="mt-2 text-sm text-gray-500">
									<span>{message.creator?.name ?? "Unknown User"}</span> -{" "}
									<span>
										{new Date(message.created_date).toLocaleTimeString()} on{" "}
										{new Date(message.created_date).toLocaleDateString()}
									</span>
								</div>
							</div>
						))}

						{/* Message after streaming completes */}
						{!loading && !streaming && messages.length > 0 && (
							<p className="text-center italic text-sm text-gray-500 mt-4">
								Message stream complete.
							</p>
						)}
					</div>
				)}

				{/* Gallery Tab Content */}
				{activeTab === "gallery" && (
					<div>
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

						{/* Gallery Images Grid (only if not loading and no error) */}
						{!galleryLoading &&
							!galleryError &&
							(galleryImages.length > 0 ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{galleryImages.map((imageUrl) => {
										// Check if the image URL ends with .gif (case-insensitive)
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
													sizes="(max-width: 640px) 50vw, 33vw"
													priority={galleryImages.indexOf(imageUrl) < 3}
													// Conditionally add the unoptimized prop for GIFs
													unoptimized={isGif}
												/>
											</div>
										);
									})}
								</div>
							) : (
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
