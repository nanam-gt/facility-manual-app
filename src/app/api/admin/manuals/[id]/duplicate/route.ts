import { NextRequest, NextResponse } from "next/server";
import { duplicateManual } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

type DuplicateRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: DuplicateRouteProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	await duplicateManual(id);

	return NextResponse.redirect(new URL("/admin/manuals", request.url), 303);
}
