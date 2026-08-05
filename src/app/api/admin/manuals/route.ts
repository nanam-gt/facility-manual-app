import { NextRequest, NextResponse } from "next/server";
import { createManual } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

const allowedStatuses = new Set(["draft", "published", "private"]);

export async function POST(request: NextRequest) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const formData = await request.formData();
	const title = String(formData.get("title") ?? "").trim();
	const areaId = String(formData.get("areaId") ?? "").trim();
	const timingId = String(formData.get("timingId") ?? "").trim();
	const statusRaw = String(formData.get("status") ?? "draft").trim();

	if (!title || !areaId || !timingId || !allowedStatuses.has(statusRaw)) {
		return NextResponse.redirect(new URL("/admin/manuals/new?error=required", request.url), 303);
	}

	await createManual({
		title,
		slug: String(formData.get("slug") ?? "").trim(),
		areaId,
		timingId,
		summary: String(formData.get("summary") ?? "").trim(),
		status: statusRaw as "draft" | "published" | "private",
	});

	return NextResponse.redirect(new URL("/admin/manuals?saved=created", request.url), 303);
}
