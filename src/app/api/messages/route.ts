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

		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let response;

		if (author) {
			// Query by author using the GSI and order by created_date
			const queryCommand = new QueryCommand({
				TableName: "chat_messages",
				KeyConditionExpression: "author = :authorValue",
				ExpressionAttributeValues: marshall({
					":authorValue": author,
				}),
				ScanIndexForward: sortAscending,
			});
			response = await dynamoDbClient.send(queryCommand);
		} else {
			const queryCommand = new QueryCommand({
				TableName: "chat_messages",
				IndexName: "GSI_PartitionKey-created_date-index", // Your GSI name
				KeyConditionExpression: "#gsi_pk = :gsi_pk_value", // Condition for the GSI's partition key
				ExpressionAttributeValues: marshall({
					":gsi_pk_value": "ALL_MESSAGES", // Your constant partition key value
				}),
				ExpressionAttributeNames: {
					"#gsi_pk": "GSI_PartitionKey", // Replace "GSI_PartitionKey" with the actual name of your GSI's partition key attribute
				},
				ScanIndexForward: sortAscending,
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
