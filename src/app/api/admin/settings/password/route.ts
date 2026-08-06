import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { ADMIN_SESSION_COOKIE, changeAdminPassword, getCurrentAdmin } from "@/lib/auth/session";

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
	const currentPassword = String(formData.get("currentPassword") ?? "");
	const newPassword = String(formData.get("newPassword") ?? "");
	const confirmPassword = String(formData.get("confirmPassword") ?? "");

	if (!currentPassword || !newPassword || !confirmPassword) {
		return NextResponse.redirect(new URL("/admin/settings?error=required", request.url), 303);
	}

	if (newPassword !== confirmPassword) {
		return NextResponse.redirect(new URL("/admin/settings?error=mismatch", request.url), 303);
	}

	if (newPassword.length < 12) {
		return NextResponse.redirect(new URL("/admin/settings?error=weak", request.url), 303);
	}

	const result = await changeAdminPassword(admin.id, currentPassword, newPassword);
	if (result !== "changed") {
		return NextResponse.redirect(new URL(`/admin/settings?error=${result}`, request.url), 303);
	}

	const response = NextResponse.redirect(new URL("/admin/login?saved=password", request.url), 303);
	response.cookies.set({
		name: ADMIN_SESSION_COOKIE,
		value: "",
		httpOnly: true,
		secure: request.nextUrl.protocol === "https:",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});

	return response;
}
