// MessageDisplay.tsx
import type { HangoutMessage } from "@/app/types";

interface MessageDisplayProps {
    messages: HangoutMessage[];
    loading: boolean;
    selectedAuthor: string | null;
    error: string | null;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages, loading, selectedAuthor, error }) => {
    return (
        <main className="w-full flex justify-center">
            {/* Messages Tab Content */}
            <div className="flex flex-col gap-4 max-w-md w-full">
                {error && <p className="text-red-500 text-center">{error}</p>}
                {loading && (
                    <div className="text-center">
                        <p className="italic text-gray-500">Loading messages...</p>
                        {/* You can add a more sophisticated loading indicator here, like a spinner */}
                    </div>
                )}
                {!loading && messages.length === 0 && !error && (
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
                            <span>{message.created_date}</span>
                        </div>
                    </div>
                ))}
                {!loading && messages.length > 0 && (
                    <p className="text-center italic text-sm text-gray-500 mt-4">
                        Message stream complete.
                    </p>
                )}
            </div>
        </main>
    );
};

export default MessageDisplay;