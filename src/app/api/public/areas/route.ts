import { NextResponse } from "next/server";
import { listPublicAreaSummaries } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

export async function GET() {
	const areas = await listPublicAreaSummaries();

	return NextResponse.json({ areas });
}
