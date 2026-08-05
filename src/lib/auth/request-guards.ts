import { NextRequest, NextResponse } from "next/server";

export function rejectCrossOriginPost(request: NextRequest): NextResponse | null {
	const requestOrigin = request.nextUrl.origin;
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");

	if (origin && origin !== requestOrigin) {
		return forbidden();
	}

	if (!origin && referer) {
		try {
			if (new URL(referer).origin !== requestOrigin) {
				return forbidden();
			}
		} catch {
			return forbidden();
		}
	}

	return null;
}

function forbidden() {
	return NextResponse.json({ error: { code: "FORBIDDEN", message: "この操作は許可されていません。" } }, { status: 403 });
}
