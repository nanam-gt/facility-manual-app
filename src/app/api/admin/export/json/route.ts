import { NextResponse } from "next/server";
import { createBackupExport } from "@/lib/admin/export-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "ログインが必要です。" } }, { status: 401 });
	}

	const backup = await createBackupExport();

	return new NextResponse(JSON.stringify(backup, null, 2), {
		headers: {
			"Content-Disposition": `attachment; filename="facility-manual-backup-${dateStamp()}.json"`,
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

function dateStamp() {
	return new Date().toISOString().slice(0, 10);
}
