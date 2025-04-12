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
    // --- State variables ---
    const [messages, setMessages] = useState<HangoutMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [sortAscending, setSortAscending] = useState(false); // Default to descending
    const [searchString, setSearchString] = useState(""); // State for search input
    const [messageCount, setMessageCount] = useState(0);

    const fetchMessages = useCallback(
        async (
            author?: string | null,
            sort?: string,
            search?: string // Accept search as a parameter
        ) => {
            setLoading(true);
            setError(null);
            setMessageCount(0);
            setMessages([]); // Clear previous messages

            let url = "/api/messages";
            const params = new URLSearchParams(); // Use URLSearchParams for easier construction

            if (author) {
                params.append("author", author);
            }
            if (sort) {
                params.append("sort", sort);
            }
            // Only add search param if search term is provided and long enough
            if (search && search.length > 3) {
                params.append("search", search);
            } else if (search && search.length <= 3) {
                // Optional: If search is provided but too short, maybe don't fetch?
                // Or fetch without the search param? Current API logic handles this,
                // but you might want UI feedback or prevent the call here.
                // For now, we proceed but the API won't use the short search string.
                console.log("Search string too short, not adding to fetch params.");
            }

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            console.log("Fetching messages from:", url); // Log the URL being fetched

            try {

                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(
                        errorData?.error || `Failed to fetch messages: ${response.status}`
                    );
                    return; // Stop processing on error
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
        [] // Remove searchString from dependencies - fetchMessages function is stable now
    );

    // --- Event Handlers ---

    const handleAuthorButtonClick = useCallback(
        (author: string) => {
            setSelectedAuthor(author);
            // Fetch for this author, including the current search term
            fetchMessages(
                author,
                sortAscending ? "asc" : "desc",
                searchString // Pass current searchString state
            );
        },
        [fetchMessages, sortAscending, searchString] // Include searchString here as it's used when calling fetchMessages
    );

    const handleFetchAllButtonClick = useCallback(() => {
        setSelectedAuthor(null);
        // Fetch all, including the current search term
        fetchMessages(
            undefined,
            sortAscending ? "asc" : "desc",
            searchString // Pass current searchString state
        );
    }, [fetchMessages, sortAscending, searchString]); // Include searchString here

    const handleSortToggle = useCallback(() => {
        setSortAscending((prev) => !prev);
    }, []);

    // This function is intended to be called by a search button/action
    const handleSearch = useCallback(() => {
        // Explicitly fetch using the current author/sort/search settings
        fetchMessages(
            selectedAuthor,
            sortAscending ? "asc" : "desc",
            searchString // Pass current searchString state
        );
    }, [fetchMessages, selectedAuthor, sortAscending, searchString]); // Include searchString here

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        // Fetch messages when author or sort order changes.
        // NOW includes the current searchString in the fetch call,
        // so changing sort re-queries with the active search term.
        console.log("Effect triggered: Fetching due to author/sort change (including current search term).");
        fetchMessages(
            selectedAuthor,
            sortAscending ? "asc" : "desc",
            searchString // Pass the current searchString state HERE
        );

        searchString // Pass the current searchString state HERE
    }, [selectedAuthor, sortAscending, fetchMessages]); // Include searchString here


    // --- Render ---
    return (
        <div className="p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">

            <MessageControls
                authors={authors}
                loading={loading}
                selectedAuthor={selectedAuthor}
                handleFetchAllButtonClick={handleFetchAllButtonClick}
                handleAuthorButtonClick={handleAuthorButtonClick}
                handleSortToggle={handleSortToggle}
                sortAscending={sortAscending}
                handleSearch={handleSearch} // Use this for a dedicated search button/action
                searchString={searchString}
                setSearchString={setSearchString} // Input field updates searchString state
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