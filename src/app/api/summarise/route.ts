import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	QueryCommand,
	type QueryCommandInput,
	type QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { HangoutMessage } from "@/app/types";
import { GoogleGenAI } from "@google/genai";

const dynamoDbClient = new DynamoDBClient({
	region: "eu-north-1",
});

const ai = new GoogleGenAI({
	apiKey: "AIzaSyC-jj61TuWzvzrNYlP6cSSWKKWe4AITq9c",
});

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;

		const searchString = searchParams.get("search");

		const allMessages: HangoutMessage[] = [];

		let lastEvaluatedKey: Record<string, AttributeValue> | undefined =
			undefined;

		const requiresPagination = !!searchString; // Paginate ONLY when querying GSI with a search string

		console.log(`Pagination required for this request: ${requiresPagination}`);

		do {
			// Loop at least once to fetch the first page

			// Query using GSI (no author specified)
			console.log(
				"Building Query command using GSI...",
				lastEvaluatedKey
					? `Starting from key: ${JSON.stringify(lastEvaluatedKey)}`
					: "",
			);
			const keyConditionExpression = "#gsi_pk = :gsi_pk_value";
			let filterExpression: string | undefined = undefined;
			let expressionAttributeValues: Record<string, AttributeValue> = marshall({
				":gsi_pk_value": "ALL_MESSAGES",
			});
			let expressionAttributeNames: Record<string, string> | undefined = {
				"#gsi_pk": "GSI_PartitionKey",
			};

			// This is the scenario where pagination *might* be needed based on `requiresPagination`
			if (searchString) {
				filterExpression = "contains(#text, :searchText)";
				expressionAttributeValues = marshall({
					...unmarshall(expressionAttributeValues),
					":searchText": searchString,
				});
				expressionAttributeNames = {
					...expressionAttributeNames,
					"#text": "text",
				};
				console.log("... GSI query includes searchString filter.");
			} else {
				console.log(
					"... GSI query fetches all messages in index (no searchString).",
				);
			}

			const commandInput: QueryCommandInput = {
				TableName: "chat_messages",
				IndexName: "GSI_PartitionKey-created_date-index",
				KeyConditionExpression: keyConditionExpression,
				FilterExpression: filterExpression,
				ExpressionAttributeValues: expressionAttributeValues,
				ExpressionAttributeNames: expressionAttributeNames,
				ExclusiveStartKey: lastEvaluatedKey,
			};
			const command: QueryCommand = new QueryCommand(commandInput);

			// --- Send Command and Process Response ---
			const response: QueryCommandOutput = await dynamoDbClient.send(command);

			if (response.Items) {
				console.log(
					`Workspaceed ${response.Count} items in this page. Scanned ${response.ScannedCount}.`,
				);
				// biome-ignore lint/complexity/noForEach: <explanation>
				response.Items.forEach((item: Record<string, AttributeValue>) =>
					allMessages.push(unmarshall(item) as HangoutMessage),
				);
			} else {
				console.log("No items returned in this page.");
			}

			lastEvaluatedKey = response.LastEvaluatedKey; // Get the key for the *potential* next iteration
			console.log(
				"LastEvaluatedKey for next page:",
				lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : "None",
			);
		} while (lastEvaluatedKey && requiresPagination);

		console.log(
			`Total messages accumulated: ${allMessages.length}. Loop finished.`,
		);

		let summary: string | undefined = undefined;

		try {
			try {
				const summaryResponse = await ai.models.generateContent({
					model: "gemini-2.0-flash",
					contents: `
					## CONTEXT
					You are a witty AI assistant specializing in summarizing chat group conversations humorously.
					The chat group has 6 members.
					The user is asking for a summary of messages related to the topic: "${searchString}".

					## MESSAGES
					Here is the relevant conversation history:
					${JSON.stringify(allMessages)} 
					## TASK

					Generate a **humorous and engaging summary** of the conversation about "${searchString}".
					- Do not attempt to add a title.					
					- Highlight the key discussion points and any funny moments or inside jokes apparent in the text provided.
					- **Quote 1-3 specific, funny, or representative messages** using Markdown blockquotes, attributing them to the author (e.g., "Funny quote." - AuthorName).
					- Refer to members by name when discussing their contributions.
					- Keep the summary relatively concise (e.g., 2-4 paragraphs).

					## OUTPUT FORMAT
					- Respond **ONLY** with the summary formatted in **Markdown**.
					- use Markdown headings for the title and sections.
					- try and style with markdown where appropriate.
					- Use paragraphs for the main summary.
					- Use Markdown blockquotes for direct quotes as specified above.
					- Use Markdown bold (**bold**) or italics (*italic*) sparingly for emphasis if appropriate.
					- **Do not include any preamble or explanation** like "Here is your summary:". Just provide the Markdown content directly.
					- **Do not include any additional text or comments** outside the Markdown content.`,
				});

				summary = summaryResponse.text; // Add the summary to the response
			} catch (summaryError) {
				console.error("Error fetching summary from Gemini API:", summaryError);
				summary = "";
			}

			const res = new Response(summary, {
				headers: {
					"Content-Type": "text/markdown; charset=utf-8",
				},
			});

			return res;
		} catch (error) {
			console.error("API request error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("Error querying/scanning DynamoDB:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: "Failed to fetch messages", details: errorMessage },
			{ status: 500 },
		);
	}
}
