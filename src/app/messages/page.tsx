// DetailsPage.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import type { HangoutMessage } from "@/app/types";

import MessageDisplay from "./messageDisplay";
import { MessageControls } from "./messageControls";

const authors = ["Gary Morris", "Mikey", "Nicholas Barooah", "Rob Croft", "Ian Rooney", "Lucy Barnes"];

// Main DetailsPage Component
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
        setMessages([]); // Clear previous messages before fetching!!!

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

            <MessageControls
                authors={authors}
                loading={loading}
                selectedAuthor={selectedAuthor}
                handleFetchAllButtonClick={handleFetchAllButtonClick}
                handleAuthorButtonClick={handleAuthorButtonClick}
                handleSortToggle={handleSortToggle}
                sortAscending={sortAscending}
            />

            <MessageDisplay
                messages={messages}
                loading={loading}
                selectedAuthor={selectedAuthor}
                error={error}
            />

            <footer className="mt-auto pt-10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Chat viewer</p>
            </footer>
        </div>
    );
}