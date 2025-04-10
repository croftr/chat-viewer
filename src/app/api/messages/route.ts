import { NextResponse, type NextRequest } from "next/server";
import {
	type AttributeValue,
	DynamoDBClient,
	ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export type HangoutMessage = {
	author: string;
	message_id: string;
	created_date: string;
	text: string;
	topic_id: string;
};

// Initialize DynamoDB client (ensure you have AWS credentials configured)
const dynamoDbClient = new DynamoDBClient({
	region: "eu-north-1",
});

export async function GET(request: NextRequest) {
	try {
		const scanCommand = new ScanCommand({
			TableName: "hangout_messages",
		});

		const response = await dynamoDbClient.send(scanCommand);

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
