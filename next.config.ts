/** @type {import('next').NextConfig} */

const s3BucketName = "chat-viewer-hangouts-gallery";
const awsRegion = "eu-north-1";

const remotePatterns = [];

if (s3BucketName && awsRegion) {
	remotePatterns.push({
		protocol: "https",
		hostname: `${s3BucketName}.s3.${awsRegion}.amazonaws.com`,
		port: "",
	});
} else {
	console.warn(
		"Missing S3_BUCKET_NAME or AWS_REGION environment variable at build time. Remote patterns for S3 images may not be configured.",
	);
}

const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: remotePatterns,
	},
	// Your other configurations...
};

module.exports = nextConfig;
