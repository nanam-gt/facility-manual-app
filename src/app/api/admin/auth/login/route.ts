import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, loginAdmin } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const email = String(formData.get("email") ?? "").trim();
	const password = String(formData.get("password") ?? "");

	if (!email || !password) {
		return NextResponse.redirect(new URL("/admin/login?error=required", request.url), 303);
	}

	try {
		const session = await loginAdmin(email, password);

		if (!session) {
			return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
		}

		const response = NextResponse.redirect(new URL("/admin", request.url), 303);
		response.cookies.set({
			name: ADMIN_SESSION_COOKIE,
			value: session.token,
			httpOnly: true,
			secure: request.nextUrl.protocol === "https:",
			sameSite: "lax",
			path: "/",
			expires: session.expiresAt,
		});

		return response;
	} catch (error) {
		console.error("Admin login failed", error);
		return NextResponse.redirect(new URL("/admin/login?error=setup", request.url), 303);
	}
}
