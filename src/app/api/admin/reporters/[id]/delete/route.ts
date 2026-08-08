import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";
import { deleteCompletionReporter } from "@/lib/db/completion-reports";

type DeleteReporterRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: DeleteReporterRouteProps) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	const result = await deleteCompletionReporter(id);
	return NextResponse.redirect(new URL(`/admin/reporters?saved=${result}`, request.url), 303);
}
