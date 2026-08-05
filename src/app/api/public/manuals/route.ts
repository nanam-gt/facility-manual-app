import { NextRequest, NextResponse } from "next/server";
import { searchPublicManuals } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const manuals = await searchPublicManuals({
		q: searchParams.get("q") ?? undefined,
		areaId: searchParams.get("areaId") ?? undefined,
		timingId: searchParams.get("timingId") ?? undefined,
	});

	return NextResponse.json({ manuals });
}
