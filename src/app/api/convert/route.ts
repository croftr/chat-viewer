import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { NextResponse } from "next/server";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

interface RawMessage {
	creator: { name: string; email?: string; user_type?: string };
	created_date: string;
	text: string;
	topic_id?: string;
	message_id?: string;
}

interface StreamlinedMessage {
	creator: string;
	created_date: string;
	text: string;
}

export async function GET() {
	const inputFilePath = path.join(process.cwd(), "data", "messages.json");
	const outputFilePath = path.join(
		process.cwd(),
		"data",
		"converted_messages.json",
	);

	let totalMessages = 0;

	try {
		const fileStream = fs.createReadStream(inputFilePath, {
			encoding: "utf-8",
		});
		const outputFileStream = fs.createWriteStream(outputFilePath);

		const jsonParser = parser();
		const arrayStreamer = streamArray();

		const streamlinedMessages: StreamlinedMessage[] = [];
		const CHUNK_SIZE = 200;
		let first = true;

		outputFileStream.write("["); // Start the JSON array

		arrayStreamer.on("data", ({ value }: { value: RawMessage }) => {
			const streamlinedMessage: StreamlinedMessage = {
				creator: value.creator.name,
				created_date: value.created_date,
				text: value.text,
			};
			streamlinedMessages.push(streamlinedMessage);

			if (streamlinedMessages.length >= CHUNK_SIZE) {
				console.log("Writing chunk of messages:", streamlinedMessages.length);
				totalMessages += streamlinedMessages.length;
				const chunkToWrite = streamlinedMessages.splice(0, CHUNK_SIZE);
				const chunkStrings = chunkToWrite
					.map((msg) => JSON.stringify(msg))
					.join(",");
				outputFileStream.write((first ? "" : ",") + chunkStrings);
				first = false;
			}
		});

		arrayStreamer.on("end", () => {
			console.log("End of stream reached. Writing remaining messages.");
			if (streamlinedMessages.length > 0) {
				const finalChunkStrings = streamlinedMessages
					.map((msg) => JSON.stringify(msg))
					.join(",");
				outputFileStream.write((first ? "" : ",") + finalChunkStrings);
			}
			outputFileStream.write("]"); // End the JSON array
			outputFileStream.end();
		});

		// Handle errors in the JSON stream processing
		arrayStreamer.on("error", (error) => {
			console.error("Error processing JSON stream:", error);
			outputFileStream.write("]"); // Ensure closing bracket is written
			outputFileStream.end();
			fileStream.destroy(); // Destroy the file stream to prevent further reading
		});

		fileStream.pipe(jsonParser).pipe(arrayStreamer);

		await finished(outputFileStream); // Wait for the output stream to finish

		console.log("Total messages processed:", totalMessages);

		return new NextResponse(
			JSON.stringify({ message: "Conversion complete" }),
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.error("Error reading or processing file:", error);
		return new NextResponse(
			JSON.stringify({ error: "Failed to process file" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}
