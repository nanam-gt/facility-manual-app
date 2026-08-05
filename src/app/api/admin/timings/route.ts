import { NextRequest, NextResponse } from "next/server";
import { upsertTiming } from "@/lib/admin/taxonomy-queries";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const formData = await request.formData();
	const name = text(formData, "name");
	if (!name) {
		return NextResponse.redirect(new URL("/admin/timings?error=required", request.url), 303);
	}

	await upsertTiming({
		id: text(formData, "id") || undefined,
		name,
		description: text(formData, "description"),
		displayOrder: numberOrZero(text(formData, "displayOrder")),
		isActive: formData.get("isActive") === "on",
	});

	return NextResponse.redirect(new URL("/admin/timings", request.url), 303);
}

function text(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "").trim();
}

function numberOrZero(value: string): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
