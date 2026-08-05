import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, revokeCurrentSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
	await revokeCurrentSession();

	const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
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
