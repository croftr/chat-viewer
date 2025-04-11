import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	QueryCommand,
	ScanCommand,
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

		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let response;
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let queryCommand;

		if (author) {
			// Query by author and optionally filter by search string
			const keyConditionExpression = "author = :authorValue";
			let filterExpression: string | undefined = undefined;
			let expressionAttributeValues: Record<string, AttributeValue> = marshall({
				":authorValue": author,
			});
			let expressionAttributeNames: Record<string, string> | undefined =
				undefined;

			if (searchString) {
				filterExpression = "contains(#text, :searchText)"; // Use #text
				expressionAttributeValues = marshall({
					...unmarshall(expressionAttributeValues),
					":searchText": searchString,
				});
				expressionAttributeNames = { "#text": "text" }; // Define #text
			}

			queryCommand = new QueryCommand({
				TableName: "chat_messages",
				KeyConditionExpression: keyConditionExpression,
				FilterExpression: filterExpression,
				ExpressionAttributeValues: expressionAttributeValues,
				ExpressionAttributeNames: expressionAttributeNames,
				ScanIndexForward: sortAscending,
			});
		} else {
			// Query all messages and optionally filter by search string
			const keyConditionExpression = "#gsi_pk = :gsi_pk_value";
			let filterExpression: string | undefined = undefined;
			let expressionAttributeValues: Record<string, AttributeValue> = marshall({
				":gsi_pk_value": "ALL_MESSAGES",
			});
			let expressionAttributeNames: Record<string, string> | undefined = {
				"#gsi_pk": "GSI_PartitionKey",
			};

			if (searchString) {
				filterExpression = "contains(#text, :searchText)"; // Use #text
				expressionAttributeValues = marshall({
					...unmarshall(expressionAttributeValues),
					":searchText": searchString,
				});
				expressionAttributeNames = {
					...expressionAttributeNames,
					"#text": "text",
				}; // Define #text
			}

			queryCommand = new QueryCommand({
				TableName: "chat_messages",
				IndexName: "GSI_PartitionKey-created_date-index",
				KeyConditionExpression: keyConditionExpression,
				FilterExpression: filterExpression,
				ExpressionAttributeValues: expressionAttributeValues,
				ExpressionAttributeNames: expressionAttributeNames,
				ScanIndexForward: sortAscending,
			});
		}

		response = await dynamoDbClient.send(queryCommand);

		const messagesAsJson: HangoutMessage[] = [];
		if (response.Items) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			response.Items.forEach((item: Record<string, AttributeValue>) =>
				messagesAsJson.push(unmarshall(item) as HangoutMessage),
			);
		}

		return NextResponse.json(messagesAsJson);
	} catch (error) {
		console.error("Error querying DynamoDB:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 },
		);
	}
}
