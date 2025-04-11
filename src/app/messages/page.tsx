"use client";

import { useState, useCallback, useEffect } from "react";
import type { HangoutMessage } from "@/app/types";

const authors = ["Gary Morris", "Mikey", "Nicholas Barooah", "Rob Croft", "Ian Rooney", "Lucy Barnes"];

export default function DetailsPage() {
    // --- State variables (Messages, Tabs, Gallery, Sort) ---
    const [messages, setMessages] = useState<HangoutMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [sortAscending, setSortAscending] = useState(false); // Default to descending

    const fetchMessages = useCallback(async (author?: string | null, sort?: string) => {
        setLoading(true);
        setError(null);

        let url = "/api/messages";
        if (author) {
            url += `?author=${encodeURIComponent(author)}`;
        }
        if (sort) {
            url += `${author ? "&" : "?"}sort=${sort}`;
        }

        try {
            const response = await fetch(url);

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

    const handleAuthorButtonClick = useCallback((author: string) => {
        setSelectedAuthor(author);
        fetchMessages(author, sortAscending ? "asc" : "desc"); // Maintain current sort
    }, [fetchMessages, sortAscending]);

    const handleFetchAllButtonClick = useCallback(() => {
        setSelectedAuthor(null);
        fetchMessages(undefined, sortAscending ? "asc" : "desc"); // Maintain current sort
    }, [fetchMessages, sortAscending]);

    const handleSortToggle = useCallback(() => {
        setSortAscending((prev) => !prev);
    }, []);

    // Fetch messages on initial load and when sort changes (if no author)
    useEffect(() => {

        fetchMessages(selectedAuthor, sortAscending ? "asc" : "desc");

    }, [fetchMessages, sortAscending, selectedAuthor]);

    return (
        <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold">Messages</h1>
            </header>

            <div className="mb-6 flex flex-wrap gap-2 justify-center">
                <button
                    type="button"
                    onClick={handleFetchAllButtonClick}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && !selectedAuthor ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading && !selectedAuthor ? "Fetching All..." : "Fetch All Messages"}
                </button>
                {authors.map((author) => (
                    <button
                        key={author}
                        type="button"
                        onClick={() => handleAuthorButtonClick(author)}
                        disabled={loading}
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && selectedAuthor === author ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading && selectedAuthor === author ? `Fetching ${author}...` : author}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleSortToggle}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Sort {sortAscending ? "Descending" : "Ascending"}
                </button>
            </div>

            <main className="w-full flex justify-center">
                {/* Messages Tab Content */}
                <div className="flex flex-col gap-4 max-w-md w-full">
                    {!loading && messages.length === 0 && (
                        <p className="text-center text-gray-600">
                            {selectedAuthor
                                ? `No messages found for ${selectedAuthor}.`
                                : 'No messages loaded. Click "Fetch All Messages" or an author button to start.'}
                        </p>
                    )}
                    {messages.map((message, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <div key={index} className="bg-gray-100 rounded-md p-4 shadow-sm">
                            <p className="text-gray-800">{message.text}</p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span>{message.author ?? "Unknown User"}</span> -{" "}
                                <span>
                                    {message.created_date}
                                </span>
                            </div>
                        </div>
                    ))}
                    {!loading && messages.length > 0 && (
                        <p className="text-center italic text-sm text-gray-500 mt-4">
                            Message stream complete.
                        </p>
                    )}
                    {loading && messages.length > 0 && (
                        <p className="text-center italic text-sm text-gray-500 mt-4">
                            Loading more messages...
                        </p>
                    )}
                </div>
            </main>

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Chat viewer</p>
            </footer>
        </div>
    );
}