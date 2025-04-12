"use client";
import { useState, useCallback } from "react"; // Import useCallback
import { FaSearch, FaSpinner } from "react-icons/fa"; // Add spinner for loading
import React from 'react'
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'

export default function Summarise() {
    const [searchString, setSearchString] = useState<string>("");
    const [messageSummary, setMessageSummary] = useState("");
    const [loading, setLoading] = useState<boolean>(false); // State for loading status
    const [error, setError] = useState<string | null>(null); // State for error messages
    const [searched, setSearched] = useState<boolean>(false); // State to track if a search has been performed

    // Function to fetch data based on searchString
    const handleSearch = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessageSummary(""); // Clear previous results
        setSearched(true); // Mark that a search attempt has been made

        const params = new URLSearchParams();
        if (searchString) {
            // The API route handles the logic for using the search string
            params.append("search", searchString);
        }

        const url = `/api/summarise?${params.toString()}`;
        console.log(`Workspaceing from: ${url}`); // Log the URL being called

        try {
            const response = await fetch(url);

            if (!response.ok) {
                let errorMsg = `Failed to fetch messages: ${response.status}`;
                try {
                    // Try to parse error details from API response body
                    const errorData = await response.json();
                    errorMsg = errorData?.details || errorData?.error || errorMsg;
                } catch (parseError) {
                    // Ignore if response body isn't valid JSON
                }
                throw new Error(errorMsg);
            }

            const data = await response.text();

            const processedMarkdown = data.replace(/\\n/g, '\n');
            setMessageSummary(processedMarkdown);

            setMessageSummary(data);

        } catch (err) {
            console.error("Error fetching summary:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }, [searchString]); // Dependency: re-create handler if searchString changes (though fetch only happens on click)


    return (
        <div className="overflow-y-auto pt-4 flex flex-col gap-4 max-w-md w-full justify-center align-center mx-auto mt-4">

            {/* Search Controls */}
            <div className="flex justify-center items-center mb-2">
                <input
                    type="text"
                    placeholder="Topic (case sensitive)" // Update placeholder if needed
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    // Allow Enter key to trigger search
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="border rounded py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:shadow-outline"
                    disabled={loading} // Disable input while loading
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 flex gap-2 items-center transition-opacity ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading} // Disable button while loading
                >
                    {loading ? (
                        <FaSpinner className="animate-spin" />
                    ) : (
                        <FaSearch />
                    )}
                    Search {/* Updated button text */}
                </button>
            </div>

            {/* Display Area */}
            <div className="w-full max-w-4xl px-4">
                {loading && (
                    <div className="text-center py-4">
                        <FaSpinner className="animate-spin inline-block mr-2" /> Loading messages...
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!loading && !error && searched && messageSummary.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                        No messages found matching your criteria.
                    </div>
                )}

                {!loading && !error && !messageSummary && (
                    <p className="text-gray-400 p-4 align-text-top">Get a summary of what the group has been saying on any topic</p>
                )}

                {!loading && !error && messageSummary.length > 0 && (
                    <div className="mt-2 space-y-2 pb-6">
                        {messageSummary && (
                            <div className="prose dark:prose-invert max-w-none">
                                <Markdown remarkPlugins={[remarkGfm]}>{messageSummary}</Markdown>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}