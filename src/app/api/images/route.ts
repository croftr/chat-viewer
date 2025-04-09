// app/api/images/route.ts
import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Use environment variables for configuration - Set these in Amplify Console -> Environment variables
const S3_BUCKET_NAME = "chat-viewer-hangouts-gallery";
const AWS_REGION = "eu-north-1";

if (!S3_BUCKET_NAME || !AWS_REGION) {
	console.error("Missing S3 Bucket Name or AWS Region environment variables");
	// Return an appropriate error response during build or runtime if needed
	// For now, we'll let it fail during S3 client initialization if vars are missing
}

// Configure the S3 client
const s3Client = new S3Client({
	region: AWS_REGION,
	// On Amplify, credentials should be automatically picked up from the Lambda execution role.
	// Locally, ensure your environment is configured (e.g., ~/.aws/credentials or ENV vars)
});

// Construct the base URL for your images (adjust region/domain if needed)
const BUCKET_URL_PREFIX = `https://<span class="math-inline">${S3_BUCKET_NAME}.s3.</span>${AWS_REGION}.amazonaws.com/`;

// Allowed image extensions (optional but good practice)
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export async function GET() {
	if (!S3_BUCKET_NAME || !AWS_REGION) {
		return NextResponse.json(
			{ error: "Server configuration error: Missing S3 details." },
			{ status: 500 },
		);
	}

	try {
		const command = new ListObjectsV2Command({
			Bucket: S3_BUCKET_NAME,
		});

		const { Contents } = await s3Client.send(command);

		if (!Contents) {
			return NextResponse.json({ images: [] });
		}

		const imageFiles = Contents
			// Ensure item has a Key and Size > 0 (filters out empty placeholders)
			.filter((item) => item.Key && item.Size && item.Size > 0)
			// Filter by allowed extensions
			.filter((item) =>
				imageExtensions.some((ext) => item.Key?.toLowerCase().endsWith(ext)),
			)
			// Map to the full public URL

			.map(
				(item) =>
					`https://chat-viewer-hangouts-gallery.s3.eu-north-1.amazonaws.com/${item.Key}`,
			);

		return NextResponse.json({ images: imageFiles });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Error listing S3 objects:", error);
		// Check for specific AWS SDK errors if needed
		if (error.name === "NoSuchBucket") {
			return NextResponse.json(
				{ error: "Configured S3 bucket not found." },
				{ status: 500 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to list images from storage." },
			{ status: 500 },
		);
	}
}
