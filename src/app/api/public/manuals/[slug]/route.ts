import { NextRequest, NextResponse } from "next/server";
import { getPublicManualBySlug } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

type ManualApiRouteProps = {
	params: Promise<{
		slug: string;
	}>;
};

export async function GET(_request: NextRequest, { params }: ManualApiRouteProps) {
	const { slug } = await params;
	const manual = await getPublicManualBySlug(slug);

	if (!manual) {
		return NextResponse.json({ error: { code: "NOT_FOUND", message: "マニュアルが見つかりません。" } }, { status: 404 });
	}

	return NextResponse.json({ manual });
}
