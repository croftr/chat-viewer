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

// RENAME the component function (e.g., from Home to DetailsPage)
export default function DetailsPage() {
    // --- State variables (Messages, Tabs, Gallery) ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);


    // --- fetchMessages function (remains the same) ---
    const fetchMessages = useCallback(async () => {
        // ... (rest of the fetchMessages function)
    }, [loading, streaming]);



    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold">Image Gallery</h1>
            </header>

            <div className="mb-6">
                <button
                    type="button"
                    onClick={fetchMessages}
                    disabled={loading || streaming}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading || streaming ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading && !streaming
                        ? "Connecting..."
                        : streaming
                            ? "Streaming Messages..."
                            : "Fetch Messages"}
                </button>
            </div>


            <main className="w-full max-w-full">
                {/* Messages Tab Content */}

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
                                <span>{message.creator?.name ?? "Unknown User"}</span> -{" "}
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

            </main>

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} My Awesome App</p>
            </footer>
        </div>
    );
}