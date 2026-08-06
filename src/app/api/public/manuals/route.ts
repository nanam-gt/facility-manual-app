import { NextRequest, NextResponse } from "next/server";
import { searchPublicManuals } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const manuals = await searchPublicManuals({
		q: searchParams.get("q") ?? undefined,
		areaId: searchParams.get("areaId") ?? undefined,
		timingId: searchParams.get("timingId") ?? undefined,
		page: numberParam(searchParams.get("page")),
		limit: numberParam(searchParams.get("limit")),
	});

	return NextResponse.json({ manuals });
}

function numberParam(value: string | null): number | undefined {
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}
