// app/api/images/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises"; // Use the promise-based version of fs
import path from "path";

// Define allowed image extensions
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

export async function GET() {
	// Construct the absolute path to the target directory (public/img)
	// process.cwd() gives the root directory of your Next.js project
	const imgDirectory = path.join(process.cwd(), "public", "img");

	try {
		// Read the contents of the directory
		const dirents = await fs.readdir(imgDirectory, { withFileTypes: true });

		// Filter out directories and keep only files with allowed image extensions
		const imageFiles = dirents
			.filter(
				(dirent) =>
					dirent.isFile() &&
					imageExtensions.includes(path.extname(dirent.name).toLowerCase()),
			)
			.map((dirent) => `/img/${dirent.name}`); // Prepend the necessary path prefix for the src prop

		// Return the list of image file paths as JSON
		return NextResponse.json({ images: imageFiles });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		// Handle errors, e.g., directory not found
		console.error("Error reading image directory:", error);
		if (error.code === "ENOENT") {
			return NextResponse.json(
				{ error: "Image directory not found." },
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to read image directory." },
			{ status: 500 },
		);
	}
}
