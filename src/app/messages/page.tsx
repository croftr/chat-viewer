"use client";

import { useState, useEffect, useCallback } from "react";
import type { HangoutMessage } from "@/app/types";

export default function DetailsPage() {
    // --- State variables (Messages, Tabs, Gallery) ---
    const [messages, setMessages] = useState<HangoutMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/messages"); // Assuming your API route is at /api/messages

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData?.error || `Failed to fetch messages: ${response.status}`);
                return;
            }

            const data: HangoutMessage[] = await response.json();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("An unexpected error occurred while fetching messages.");
        } finally {
            setLoading(false);
        }
    }, []);


    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold">Image Gallery</h1>
            </header>

            <div className="mb-6">
                <button
                    type="button"
                    onClick={fetchMessages}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading ? "Connecting..." : "Fetch Messages"}
                </button>
            </div>


            <main className="w-full max-w-full">
                {/* Messages Tab Content */}

                <div className="flex flex-col gap-4 max-w-md w-full">
                    {!loading && messages.length === 0 && (
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
                    {!loading && messages.length > 0 && (
                        <p className="text-center italic text-sm text-gray-500 mt-4">
                            Message stream complete.
                        </p>
                    )}
                    {messages.length > 0 && (
                        <p className="text-center italic text-sm text-gray-500 mt-4">
                            Streaming more messages...
                        </p>
                    )}
                </div>

            </main>

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} My Awesome App</p>
            </footer>
        </div>
    );
}