import { NextRequest, NextResponse } from "next/server";
import { softDeleteManual } from "@/lib/admin/manual-queries";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";

type DeleteRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: DeleteRouteProps) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	await softDeleteManual(id);

	return NextResponse.redirect(new URL("/admin/manuals?saved=deleted", request.url), 303);
}
