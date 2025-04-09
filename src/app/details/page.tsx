// app/details/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// --- Message interface ---
interface Message {
	text: string;
	created_date: string;
	creator: {
		name: string;
	};
}

type ActiveTab = "messages" | "gallery";

// RENAME the component function (e.g., from Home to DetailsPage)
export default function DetailsPage() {
	// --- State variables (Messages, Tabs, Gallery) ---
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const [streaming, setStreaming] = useState(false);
	const [activeTab, setActiveTab] = useState<ActiveTab>("messages");
	const [galleryImages, setGalleryImages] = useState<string[]>([]);
	const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
	const [galleryError, setGalleryError] = useState<string | null>(null);

	// --- fetchMessages function ---
	const fetchMessages = useCallback(async () => {
		// Reset states
		setLoading(true);
		setStreaming(true); // Indicate connection attempt / stream start
		setMessages([]);
		// Ensure messages tab is active when fetching
		setActiveTab("messages");

		try {
			const response = await fetch("/api/messages", {
				headers: { Accept: "text/event-stream" },
			});

			if (!response.ok || !response.body) {
				console.error(
					"Failed to fetch SSE stream:",
					response.status,
					response.statusText,
				);
				throw new Error(`Failed to fetch stream: ${response.statusText}`);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedData = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					setStreaming(false); // Stream finished
					break;
				}
				if (value) {
					// Still loading as long as stream is active
					if (!loading) setLoading(true);
					if (!streaming) setStreaming(true);

					accumulatedData += decoder.decode(value, { stream: true });
					const lines = accumulatedData.split("\n");
					accumulatedData = lines.pop() || "";

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const jsonDataString = line.substring(6);
							if (jsonDataString.trim()) {
								try {
									const jsonData: Message = JSON.parse(jsonDataString);
									setMessages((prevMessages) => [...prevMessages, jsonData]);
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
				}
			}
			// Set loading to false only after the loop finishes and stream is done
			setLoading(false);
		} catch (error) {
			console.error("Error fetching messages:", error);
			setMessages([]); // Clear messages on error
			setLoading(false);
			setStreaming(false);
		}
	}, [loading, streaming]); // Add streaming dependency if its state affects logic inside

	// --- Fetch Gallery Images useEffect ---
	useEffect(() => {
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

				console.log("checking response", data);
				setGalleryImages(data.images || []);
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				console.error("Failed to fetch gallery images:", error);
				setGalleryError(error.message || "An unknown error occurred");
				setGalleryImages([]);
			} finally {
				setGalleryLoading(false);
			}
		};

		fetchGalleryImages();
	}, []);

	// --- getTabClass helper ---
	const getTabClass = (tabName: ActiveTab) => {
		return `py-2 px-4 rounded-t-md font-medium focus:outline-none ${
			activeTab === tabName
				? "bg-white border border-gray-300 border-b-0 text-blue-600"
				: "bg-gray-100 text-gray-600 hover:bg-gray-200"
		}`;
	};

	// --- Return JSX (exactly as it was in Home) ---
	return (
		<div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
			<header className="text-center mb-6">
				{/* You might want a different title for this page */}
				<h1 className="text-2xl font-bold">Details - Messages & Gallery</h1>
			</header>

			{/* Fetch Messages Button */}
			<div className="mb-6">
				<button
					type="button"
					onClick={fetchMessages}
					// Fix the disabled logic - disable if currently loading/streaming
					disabled={loading || streaming}
					// Restore className logic
					className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading || streaming ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{loading && !streaming
						? "Connecting..."
						: streaming
							? "Streaming Messages..."
							: "Fetch Messages"}
				</button>
				{/* Simplify indicator - handled by button text mostly */}
				{/* {loading && !streaming && messages.length === 0 && (
                     <p className="text-center italic text-sm mt-2">Connecting...</p>
                 )} */}
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
						{/* Show 'no messages' only if NOT loading/streaming and list is empty */}
						{!loading && !streaming && messages.length === 0 && (
							<p className="text-center text-gray-600">
								No messages loaded. Click "Fetch Messages" to start.
							</p>
						)}

						{/* Message List */}
						{messages.map((message, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<div key={index} className="bg-gray-100 rounded-md p-4 shadow-sm">
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
						{/* Indicate if still streaming but messages have arrived */}
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
						{!galleryLoading &&
							!galleryError &&
							(galleryImages.length > 0 ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
													sizes="(max-width: 640px) 50vw, 33vw"
													priority={galleryImages.indexOf(imageUrl) < 3}
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
				{/* You might want a different footer or none */}
				<p>&copy; {new Date().getFullYear()} My Awesome App</p>
			</footer>
		</div>
	);
}
