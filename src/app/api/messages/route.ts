import fs from "fs";
import path from "path";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

// --- Type Definitions ---

// Interface for the raw object structure read from the JSON file/stream
interface RawMessageFromFile {
	creator: {
		name: string;
		email?: string; // Include other fields that might exist in the file
		user_type?: string;
	};
	created_date: string; // Expecting string date from file
	text: string;
	topic_id?: string; // Include other fields that might exist
	message_id?: string; // Include other fields that might exist
}

// Interface for the structure we want to send in each SSE event's data payload
interface OutputMessageSSE {
	text: string;
	created_date: string; // Will be the string from the file
	creator: {
		name: string;
	};
}

// --- Helper Function: Get File Read Stream ---
/**
 * Creates a readable stream for the specified file.
 * @param relativePath - The path relative to the project root (e.g., "data/test.json").
 * @returns A readable file stream.
 */
function getFileReadStream(relativePath: string): fs.ReadStream {
	const filePath = path.join(process.cwd(), relativePath);
	console.log(`Attempting to stream file from: ${filePath}`);
	return fs.createReadStream(filePath, { encoding: "utf-8" }); // Specify encoding
}

// --- Helper Function: Process JSON Stream as SSE ---
/**
 * Processes a JSON stream (expected to be an array), extracts specific data,
 * and sends it as Server-Sent Events.
 * @param readStream - The readable stream of the JSON file content.
 * @param controller - The controller for the ReadableStream used in the Response.
 */
async function processJsonStreamToSSE(
	readStream: fs.ReadStream,
	controller: ReadableStreamDefaultController,
): Promise<void> {
	const jsonParser = parser();
	// Since your example JSON is an array at the root, use streamArray() without arguments
	const valueStreamer = streamArray();

	// Helper to encode and enqueue data, handling potential controller closure
	const enqueueSseData = (data: object | string, eventType?: string) => {
		let eventString = "";
		if (eventType) {
			eventString += `event: ${eventType}\n`;
		}
		// Ensure data is stringified if it's an object
		const dataString = typeof data === "string" ? data : JSON.stringify(data);
		eventString += `data: ${dataString}\n\n`;
		try {
			controller.enqueue(new TextEncoder().encode(eventString));
		} catch (e) {
			// Controller might be closed if client disconnected
			console.warn("Failed to enqueue data (client likely disconnected):", e);
			// Attempt to gracefully shut down the stream processing if not already destroyed
			if (readStream && !readStream.destroyed) {
				readStream.unpipe(); // Stop piping
				readStream.destroy(); // Destroy the source stream
				console.log("Source stream destroyed due to enqueue error.");
			}
		}
	};

	// Handle file stream errors during processing
	readStream.on("error", (error) => {
		console.error("Error reading file stream during processing:", error);
		enqueueSseData(
			{ error: `Failed during file read: ${error.message}` },
			"error",
		);
		try {
			controller.close();
		} catch (e) {
			/* Ignore error if already closed */
		}
		// No need to destroy here, error event should propagate and end stream
	});

	// Handle unexpected close of read stream
	readStream.on("close", () => {
		console.log("Read stream closed.");
		// The 'end' event on the valueStreamer should handle final closure
	});

	// Set up the JSON streaming pipeline
	readStream.pipe(jsonParser).pipe(valueStreamer);

	// Process each item found in the JSON array
	valueStreamer.on(
		"data",
		({ key, value }: { key: number; value: RawMessageFromFile }) => {
			// ----> This is where the transformation happens <----
			// Construct the specific object structure you want to send
			const outputPayload: OutputMessageSSE = {
				text: value.text,
				created_date: value.created_date, // Include the date string from the file
				creator: {
					name: value.creator.name, // Include the nested creator name
				},
			};
			// Send only the transformed object in the 'data' field
			enqueueSseData(outputPayload); // Default 'message' event type
		},
	);

	// Handle errors during JSON parsing/streaming
	valueStreamer.on("error", (error: Error) => {
		console.error("Error processing JSON stream:", error);
		enqueueSseData({ error: error.message || "JSON streaming error" }, "error");
		try {
			controller.close();
		} catch (e) {
			/* Ignore error if already closed */
		}
		// Destroy upstream if pipeline fails
		if (readStream && !readStream.destroyed) readStream.destroy();
	});

	// Handle the end of the JSON stream
	valueStreamer.on("end", () => {
		console.log("Finished streaming all JSON items.");
		// Send a final completion event
		enqueueSseData({ message: "Processing complete" }, "complete");
		try {
			controller.close();
		} catch (e) {
			/* Ignore error if already closed */
		} // Successfully finished
	});
}

// --- API Route Handler (using the streaming helpers) ---
export async function GET() {
	try {
		const stream = new ReadableStream({
			async start(controller) {
				let readStream: fs.ReadStream | null = null;
				try {
					// 1. Get the file stream
					// readStream = getFileReadStream("data/converted_messages.json");
					readStream = getFileReadStream("data/test.json");

					// Handle immediate file opening errors (e.g., file not found)
					readStream.once("error", (error) => {
						// This listener should be 'once' as the main handler is in processJsonStreamToSSE
						console.error("Error opening file stream:", error);
						try {
							const errorData = `event: error\ndata: ${JSON.stringify({ error: `Failed to open or read file: ${error.message}` })}\n\n`;
							controller.enqueue(new TextEncoder().encode(errorData));
							controller.close();
						} catch (e) {
							// Ignore further errors if controller is already closed
						}
						// Ensure stream is destroyed if it failed to open correctly
						if (readStream && !readStream.destroyed) readStream.destroy();
					});

					// 2. Process the stream and send SSE events
					// We don't await this; it runs asynchronously via event handlers
					processJsonStreamToSSE(readStream, controller);

					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				} catch (error: any) {
					// Catch synchronous errors in start (e.g., from getFileReadStream if it threw)
					console.error("Error in ReadableStream start:", error);
					try {
						const errorData = `event: error\ndata: ${JSON.stringify({ error: error.message || "Internal server error during start" })}\n\n`;
						controller.enqueue(new TextEncoder().encode(errorData));
						controller.close();
					} catch (e) {
						/* Ignore */
					}
					// Clean up stream if it exists and failed early
					if (readStream && !readStream.destroyed) {
						readStream.destroy();
					}
				}
			},
			cancel(reason) {
				console.log("SSE Stream cancelled by client:", reason);
				// You might want to add logic here to explicitly destroy the readStream
				// although the enqueue error handling might already cover it.
			},
		});

		// 3. Return the Response with SSE headers
		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
				// Optional: Add CORS headers if accessed from different origin
				// "Access-Control-Allow-Origin": "*",
			},
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		// Catch errors during Response object creation itself
		console.error("Error creating SSE response object:", error);
		return new Response(
			JSON.stringify({
				error: `Failed to create SSE stream: ${error.message}`,
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
