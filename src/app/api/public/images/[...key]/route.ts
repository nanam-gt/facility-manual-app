import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/db/client";

type ImageRouteProps = {
	params: Promise<{
		key: string[];
	}>;
};

export async function GET(_request: NextRequest, { params }: ImageRouteProps) {
	const { key } = await params;
	const objectKey = key.join("/");

	if (!objectKey.startsWith("manuals/")) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const env = await getEnv();
	const object = await env.MANUAL_IMAGES?.get(objectKey);

	if (!object) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return new NextResponse(object.body, {
		headers: {
			"Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
			"Cache-Control": "public, max-age=31536000, immutable",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
