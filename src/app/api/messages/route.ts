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

		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let response;

		if (author) {
			// Query by author using the GSI and order by created_date
			const queryCommand = new QueryCommand({
				TableName: "hangout_messages",
				KeyConditionExpression: "author = :authorValue",
				ExpressionAttributeValues: marshall({
					":authorValue": author,
				}),
				ScanIndexForward: false, // Set to true for ascending, false for descending
			});
			response = await dynamoDbClient.send(queryCommand);
		} else {
			const queryCommand = new QueryCommand({
				TableName: "hangout_messages",
				// IndexName: "date-index", // Name of the new GSI
				KeyConditionExpression: "GLOBAL = :globalValue", // Changed attribute name
				ExpressionAttributeValues: marshall({
					":globalValue": "GLOBAL", // Changed attribute value to match
				}),
				ScanIndexForward: false, // Set to true for ascending, false for descending
			});

			response = await dynamoDbClient.send(queryCommand);
		}

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const messagesAsJson: any[] = [];
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
