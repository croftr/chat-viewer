import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Buffer } from "node:buffer";

const ai = new GoogleGenAI({
	apiKey: "AIzaSyC-jj61TuWzvzrNYlP6cSSWKKWe4AITq9c",
});

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);

	let searchString = searchParams.get("search");

	if (searchString) {
		searchString = searchString.trim().toLowerCase();
	}

	const contents = `Create a funny cartoon picture of a ${searchString}.`;

	try {
		// Set responseModalities to include "Image" so the model can generate  an image
		const response = await ai.models.generateContent({
			model: "gemini-2.0-flash-exp-image-generation",
			contents,
			config: {
				responseModalities: ["Text", "Image"],
			},
		});

		// Extract the image data from the response
		// Check if the response contains image data
		if (!response.candidates || response.candidates.length === 0) {
			console.error("No candidates found in response.");
			return NextResponse.json(
				{ error: "Image generation failed" },
				{ status: 500 },
			);
		}
		const imagePart = response.candidates[0]?.content?.parts?.find(
			(part) => part.inlineData !== null,
		);

		if (imagePart?.inlineData?.data) {
			const imageData = imagePart.inlineData.data; // Base64-encoded image data
			const buffer = Buffer.from(imageData, "base64"); // Convert Base64 to binary

			return new NextResponse(buffer, {
				headers: {
					"Content-Type": "image/png",
					"Content-Disposition": `inline; filename="${searchString}.png"`,
				},
			});
		}
	} catch (error) {
		console.error("API request error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}

	// Default return statement to handle any unexpected code paths
	return NextResponse.json(
		{ error: "Unexpected error occurred" },
		{ status: 500 },
	);
}
