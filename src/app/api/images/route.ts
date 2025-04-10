// app/api/images/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Use environment variables for configuration - Set these in Amplify Console -> Environment variables
const S3_BUCKET_NAME = "chat-viewer-hangouts-gallery";
const AWS_REGION = "eu-north-1";

if (!S3_BUCKET_NAME || !AWS_REGION) {
    console.error("Missing S3 Bucket Name or AWS Region environment variables");
}

// Configure the S3 client
const s3Client = new S3Client({
    region: AWS_REGION,    
});

// Construct the base URL for your images (adjust region/domain if needed)
const BUCKET_URL_PREFIX = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/`;

// Allowed image extensions (optional but good practice)
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export async function GET(request: NextRequest) {
    if (!S3_BUCKET_NAME || !AWS_REGION) {
        return NextResponse.json(
            { error: "Server configuration error: Missing S3 details." },
            { status: 500 },
        );
    }

    const { searchParams } = request.nextUrl;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20; // Default limit to 20
    const nextToken = searchParams.get("nextToken") || undefined;

    if (isNaN(limit) || limit <= 0 || limit > 100) {
        return NextResponse.json({ error: "Invalid limit parameter." }, { status: 400 });
    }

	console.log('mimit is '		+ limit);
	

    try {
        console.log(`Trying to list objects in bucket: ${S3_BUCKET_NAME} with limit: ${limit}, nextToken: ${nextToken}`);
				
        const command = new ListObjectsV2Command({
            Bucket: S3_BUCKET_NAME,
            MaxKeys: limit,
            ContinuationToken: nextToken,
        });

        console.log(`Sending command to S3: ${JSON.stringify(command)}`);

        const response = await s3Client.send(command);
        const { Contents, NextContinuationToken, IsTruncated } = response;
				
        if (!Contents) {
            return NextResponse.json({ images: [], nextToken: undefined });
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
                    `${BUCKET_URL_PREFIX}${item.Key}`,
            );

        return NextResponse.json({
            images: imageFiles,
            nextToken: NextContinuationToken,
            isTruncated: IsTruncated,
        });
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
        console.error("Error listing S3 objects with pagination:", error);
        // Check for specific AWS SDK errors if needed
        if (error.name === "NoSuchBucket") {
            return NextResponse.json(
                { error: "Configured S3 bucket not found." },
                { status: 500 },
            );
        }
        return NextResponse.json(
            { error: "Failed to list images from storage with pagination." },
            { status: 500 },
        );
    }
}