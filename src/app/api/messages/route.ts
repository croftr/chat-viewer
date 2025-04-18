import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	QueryCommand,
	type ScanCommand,
	type QueryCommandInput,
	type QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { FilteredHangoutMessage, HangoutMessage } from "@/app/types";

const dynamoDbClient = new DynamoDBClient({
	region: "eu-north-1",
});

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const author = searchParams.get("author");
		const sortOrder = searchParams.get("sort");
		const sortAscending = sortOrder ? sortOrder.toLowerCase() === "asc" : false;
		let searchString = searchParams.get("search");

		if (searchString) {
			searchString = searchString.trim().toLowerCase();
		}

		const allMessages: FilteredHangoutMessage[] = []; // Array to accumulate results
		let lastEvaluatedKey: Record<string, AttributeValue> | undefined =
			undefined;

		const requiresPagination = !!searchString; // Paginate ONLY when querying GSI with a search string

		console.log(`Pagination required for this request: ${requiresPagination}`);

		do {
			// Loop at least once to fetch the first page
			let commandInput: QueryCommandInput;
			let command: QueryCommand | ScanCommand;

			// --- Query Logic ---
			if (author) {
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
					filterExpression = "contains(#formatted_text, :searchText)";
					expressionAttributeValues = marshall({
						...unmarshall(expressionAttributeValues),
						":searchText": searchString,
					});
					expressionAttributeNames = { "#formatted_text": "text" };
				}

				commandInput = {
					TableName: "formatted_messages",
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
					filterExpression = "contains(#formatted_text, :searchText)";
					expressionAttributeValues = marshall({
						...unmarshall(expressionAttributeValues),
						":searchText": searchString,
					});
					expressionAttributeNames = {
						...expressionAttributeNames,
						"#formatted_text": "formatted_text",
					};
					console.log("... GSI query includes searchString filter.");
				} else {
					console.log(
						"... GSI query fetches all messages in index (no searchString).",
					);
				}

				commandInput = {
					TableName: "formatted_messages",
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

			// --- Send Command and Process Response ---
			const response: QueryCommandOutput = await dynamoDbClient.send(command);

			if (response.Items) {
				console.log(
					`Workspaceed ${response.Count} items in this page. Scanned ${response.ScannedCount}.`,
				);
				// biome-ignore lint/complexity/noForEach: <explanation>
				response.Items.forEach((item: Record<string, AttributeValue>) => {
					const unmarshalledItem = unmarshall(item);
					// Filter out unwanted attributes here
					const filteredItem: FilteredHangoutMessage = {
						created_date: unmarshalledItem.created_date,
						text: unmarshalledItem.text,
						author: unmarshalledItem.author,
						// Add other desired fields as needed
					};
					allMessages.push(filteredItem);
				});
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
