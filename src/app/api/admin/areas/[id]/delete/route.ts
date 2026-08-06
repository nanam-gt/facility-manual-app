import { NextRequest, NextResponse } from "next/server";
import { deleteAreaIfUnused } from "@/lib/admin/taxonomy-queries";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";

type DeleteAreaRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: DeleteAreaRouteProps) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	const result = await deleteAreaIfUnused(id);

	return NextResponse.redirect(new URL(`/admin/areas?saved=${result}`, request.url), 303);
}
