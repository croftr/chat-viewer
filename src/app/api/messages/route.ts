import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	ScanCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { HangoutMessage } from "@/app/types";

// Initialize DynamoDB client (ensure you have AWS credentials configured)
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
			// Query by author (partition key)
			const queryCommand = new QueryCommand({
				TableName: "hangout_messages",
				KeyConditionExpression: "author = :authorValue",
				ExpressionAttributeValues: marshall({
					":authorValue": author,
				}),
			});
			response = await dynamoDbClient.send(queryCommand);
		} else {
			// Scan the entire table if no author is provided
			const scanCommand = new ScanCommand({
				TableName: "hangout_messages",
			});
			response = await dynamoDbClient.send(scanCommand);
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
