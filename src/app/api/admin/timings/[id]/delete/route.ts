import { NextRequest, NextResponse } from "next/server";
import { deleteTimingIfUnused } from "@/lib/admin/taxonomy-queries";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";

type DeleteTimingRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: DeleteTimingRouteProps) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	const result = await deleteTimingIfUnused(id);

	return NextResponse.redirect(new URL(`/admin/timings?saved=${result}`, request.url), 303);
}
