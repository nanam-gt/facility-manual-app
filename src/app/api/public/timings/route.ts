import { NextResponse } from "next/server";
import { listPublicTimingSummaries } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

export async function GET() {
	const timings = await listPublicTimingSummaries();

	return NextResponse.json({ timings });
}
