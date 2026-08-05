import { NextRequest, NextResponse } from "next/server";
import { upsertArea } from "@/lib/admin/taxonomy-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const formData = await request.formData();
	const name = text(formData, "name");
	if (!name) {
		return NextResponse.redirect(new URL("/admin/areas?error=required", request.url), 303);
	}

	await upsertArea({
		id: text(formData, "id") || undefined,
		code: text(formData, "code"),
		name,
		shortName: text(formData, "shortName"),
		description: text(formData, "description"),
		colorKey: text(formData, "colorKey"),
		displayOrder: numberOrZero(text(formData, "displayOrder")),
		isActive: formData.get("isActive") === "on",
	});

	return NextResponse.redirect(new URL("/admin/areas", request.url), 303);
}

function text(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "").trim();
}

function numberOrZero(value: string): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
