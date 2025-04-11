"use client";

import { useState } from "react";
import { IconContext } from "react-icons";
import {
    FaArrowDown,
    FaArrowUp,
    FaCalendarAlt,
    FaSearch,
} from "react-icons/fa";
import { messageMetadata } from '../constants'; // Assuming this contains your metadata

const authors = [
    "Gary Morris",
    "Mikey",
    "Nicholas Barooah",
    "Rob Croft",
    "Ian Rooney",
    "Lucy Barnes",
];

// Separate Component for Author and Fetch All Buttons
export default function MessageControls({
    authors,
    loading,
    selectedAuthor,
    handleFetchAllButtonClick,
    handleAuthorButtonClick,
    handleSortToggle,
    sortAscending,
    handleSearch,
    searchString,
    setSearchString,
    messageCount,
}: {
    authors: string[];
    loading: boolean;
    selectedAuthor: string | null;
    handleFetchAllButtonClick: () => void;
    handleAuthorButtonClick: (author: string) => void;
    handleSortToggle: () => void;
    sortAscending: boolean;
    handleSearch: () => void;
    searchString: string;
    setSearchString: (search: string) => void;
    messageCount: number;
}) {
    const [localSearchString, setLocalSearchString] = useState(searchString);
    const [currentAuthorName, setCurrentAuthorName] = useState<string | null>(null); // New state

    const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchString(e.target.value);
    };

    const handleAuthorClick = (author: string) => {
        handleAuthorButtonClick(author);
        setCurrentAuthorName(author); // Set author name in local state
    };

    return (
        <div className="mb-6 flex flex-col gap-4 justify-center">
            {/* Fetch All and Author Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    type="button"
                    onClick={handleFetchAllButtonClick}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && !selectedAuthor ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {loading && !selectedAuthor ? "Fetching All..." : "All Authors"}
                </button>
                {authors.map((author) => (
                    <button
                        key={author}
                        type="button"
                        onClick={() => handleAuthorClick(author)} // Use handleAuthorClick
                        disabled={loading}
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && selectedAuthor === author ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading && selectedAuthor === author ? `Fetching ${author}...` : author}
                    </button>
                ))}
            </div>

            {/* Sort Button */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleSortToggle}
                    aria-label={
                        sortAscending ? "Sort by date descending" : "Sort by date ascending"
                    }
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    <IconContext.Provider value={{ size: "1em", className: "react-icons" }}>
                        <span className="flex items-center gap-1">
                            {sortAscending ? <FaArrowUp /> : <FaArrowDown />}
                            <FaCalendarAlt />
                        </span>
                    </IconContext.Provider>
                </button>

                <div className="ml-4 text-gray-100 gap-1 flex items-center">
                    {messageCount}
                    {/* {!messageCount && currentAuthorName && currentAuthorName in messageMetadata.messagesByAuthor
                        ? messageMetadata.messagesByAuthor[currentAuthorName as keyof typeof messageMetadata.messagesByAuthor]
                        : messageMetadata.totalMessages} */}
                    <span className="text-gray-100">messages</span>
                </div>
            </div>

            {/* Search Input and Button */}
            <div className="flex justify-center items-center">
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)} // Update state on input change
                    className="border rounded py-2 px-3 text-white bg-gray-700 focus:outline-none focus:shadow-outline"
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                >
                    <FaSearch />
                </button>
            </div>
        </div>
    );
}