"use client";

import { useState, useCallback, useEffect } from "react";
import type { HangoutMessage } from "@/app/types";
import MessageControls from "./messageControls";
import MessageDisplay from "./messageDisplay";

const authors = [
    "Gary Morris",
    "Mikey",
    "Nicholas Barooah",
    "Rob Croft",
    "Ian Rooney",
    "Lucy Barnes",
];

// Main DetailsPage Component
export default function DetailsPage() {
    // --- State variables (Messages, Tabs, Gallery, Sort, Search) ---
    const [messages, setMessages] = useState<HangoutMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [sortAscending, setSortAscending] = useState(false); // Default to descending
    const [searchString, setSearchString] = useState(""); // New state for search
    const [messageCount, setMessageCount] = useState(0); // New state for search

    const fetchMessages = useCallback(
        async (author?: string | null, sort?: string) => {

            setLoading(true);
            setError(null);
            setMessageCount(0); // Reset message count
            setMessages([]); // Clear previous messages before fetching!!!

            let url = "/api/messages";
            if (author) {
                url += `?author=${encodeURIComponent(author)}`;
            }
            if (sort) {
                url += `${author ? "&" : "?"}sort=${sort}`;
            }
            if (searchString) {
                url += `${author || sort ? "&" : "?"}search=${encodeURIComponent(searchString)}`;
            }

            try {
                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(
                        errorData?.error || `Failed to fetch messages: ${response.status}`,
                    );
                    return;
                }

                const data: HangoutMessage[] = await response.json();
                setMessageCount(data.length);
                setMessages(data);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("An unexpected error occurred while fetching messages.");
            } finally {
                setLoading(false);
            }
        },
        [searchString],
    );

    const handleAuthorButtonClick = useCallback(
        (author: string) => {
            setSelectedAuthor(author);
            fetchMessages(
                author,
                sortAscending ? "asc" : "desc",
            );
        },
        [fetchMessages, sortAscending],
    );

    const handleFetchAllButtonClick = useCallback(() => {
        setSelectedAuthor(null);
        fetchMessages(
            undefined,
            sortAscending ? "asc" : "desc",
        );
    }, [fetchMessages, sortAscending]);

    const handleSortToggle = useCallback(() => {
        setSortAscending((prev) => !prev);
    }, []);

    const handleSearch = useCallback(() => {
        fetchMessages(selectedAuthor, sortAscending ? "asc" : "desc");
    }, [fetchMessages, selectedAuthor, sortAscending]);

    // Fetch messages on initial load (without search)
    useEffect(() => {
        fetchMessages(selectedAuthor, sortAscending ? "asc" : "desc");
    }, [fetchMessages, selectedAuthor, sortAscending]);

    return (
        <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">

            <MessageControls
                authors={authors}
                loading={loading}
                selectedAuthor={selectedAuthor}
                handleFetchAllButtonClick={handleFetchAllButtonClick}
                handleAuthorButtonClick={handleAuthorButtonClick}
                handleSortToggle={handleSortToggle}
                sortAscending={sortAscending}
                handleSearch={handleSearch} // Pass the new handler
                searchString={searchString}
                setSearchString={setSearchString}
                messageCount={messageCount}
            />

            <MessageDisplay
                messages={messages}
                loading={loading}
                selectedAuthor={selectedAuthor}
                error={error}
            />
        </div>
    )
}