import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	QueryCommand,
	ScanCommand,
	type QueryCommandInput,
	type ScanCommandInput,
	type QueryCommandOutput,
	type ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { HangoutMessage } from "@/app/types";

const dynamoDbClient = new DynamoDBClient({
	region: "eu-north-1",
});

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const author = searchParams.get("author");
		const sortOrder = searchParams.get("sort");
		const sortAscending = sortOrder ? sortOrder.toLowerCase() === "asc" : false;
		const searchString = searchParams.get("search");
		const fullScanParam = searchParams.get("fullScan");
		const performFullScan = fullScanParam?.toLowerCase() === "true";

		const allMessages: HangoutMessage[] = []; // Array to accumulate results
		let lastEvaluatedKey: Record<string, AttributeValue> | undefined =
			undefined;

		// Determine if pagination should be actively pursued for this request
		// We paginate ONLY if doing a GSI query AND searchString is present.
		// We'll assume fullScan doesn't need pagination unless explicitly added back.
		// Adjust this condition if you want fullScan to also paginate by default.
		const requiresPagination = !!searchString; // Paginate ONLY when querying GSI with a search string

		// If you ALSO want fullScan to paginate, change the above line to:
		// const requiresPagination = performFullScan || (!author && !!searchString);

		console.log(`Pagination required for this request: ${requiresPagination}`);

		do {
			// Loop at least once to fetch the first page
			let commandInput: QueryCommandInput | ScanCommandInput;
			let command: QueryCommand | ScanCommand;

			if (performFullScan) {
				// --- Full Scan Logic ---
				// NOTE: As currently configured, this scan WON'T paginate beyond the first page
				//       unless you change the `requiresPagination` logic above.
				console.log(
					"Building Scan command...",
					lastEvaluatedKey
						? `Starting from key: ${JSON.stringify(lastEvaluatedKey)}`
						: "",
				);
				commandInput = {
					TableName: "chat_messages",
					ExclusiveStartKey: lastEvaluatedKey,
					// FilterExpression etc. could be added here if needed for scan
				};
				command = new ScanCommand(commandInput);
			} else {
				// --- Query Logic ---
				if (author) {
					// Query by author
					// NOTE: As currently configured, this query WON'T paginate beyond the first page.
					console.log(
						"Building Query command by author...",
						lastEvaluatedKey
							? `Starting from key: ${JSON.stringify(lastEvaluatedKey)}`
							: "",
					);
					const keyConditionExpression = "author = :authorValue";
					let filterExpression: string | undefined = undefined;
					let expressionAttributeValues: Record<string, AttributeValue> =
						marshall({ ":authorValue": author });
					let expressionAttributeNames: Record<string, string> | undefined =
						undefined;

					if (searchString) {
						filterExpression = "contains(#text, :searchText)";
						expressionAttributeValues = marshall({
							...unmarshall(expressionAttributeValues),
							":searchText": searchString,
						});
						expressionAttributeNames = { "#text": "text" };
					}

					commandInput = {
						TableName: "chat_messages",
						KeyConditionExpression: keyConditionExpression,
						FilterExpression: filterExpression,
						ExpressionAttributeValues: expressionAttributeValues,
						ExpressionAttributeNames: expressionAttributeNames,
						ScanIndexForward: sortAscending,
						ExclusiveStartKey: lastEvaluatedKey,
					};
					command = new QueryCommand(commandInput);
				} else {
					// Query using GSI (no author specified)
					console.log(
						"Building Query command using GSI...",
						lastEvaluatedKey
							? `Starting from key: ${JSON.stringify(lastEvaluatedKey)}`
							: "",
					);
					const keyConditionExpression = "#gsi_pk = :gsi_pk_value";
					let filterExpression: string | undefined = undefined;
					let expressionAttributeValues: Record<string, AttributeValue> =
						marshall({ ":gsi_pk_value": "ALL_MESSAGES" });
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

					commandInput = {
						TableName: "chat_messages",
						IndexName: "GSI_PartitionKey-created_date-index",
						KeyConditionExpression: keyConditionExpression,
						FilterExpression: filterExpression,
						ExpressionAttributeValues: expressionAttributeValues,
						ExpressionAttributeNames: expressionAttributeNames,
						ScanIndexForward: sortAscending,
						ExclusiveStartKey: lastEvaluatedKey,
					};
					command = new QueryCommand(commandInput);
				}
			}

			// --- Send Command and Process Response ---
			const response: QueryCommandOutput | ScanCommandOutput =
				await dynamoDbClient.send(command);

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

			// --- Loop Condition ---
			// Continue looping ONLY if:
			// 1. DynamoDB returned a LastEvaluatedKey (meaning there *might* be more data)
			// AND
			// 2. The specific scenario requires us to fetch all pages (`requiresPagination` is true)
		} while (lastEvaluatedKey && requiresPagination);

		console.log(
			`Total messages accumulated: ${allMessages.length}. Loop finished.`,
		);

		return NextResponse.json(allMessages);
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
