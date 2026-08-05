import { NextResponse } from "next/server";
import { backupToCsv, createBackupExport } from "@/lib/admin/export-queries";
import { getCurrentAdmin } from "@/lib/auth/session";
import { formatJstDate } from "@/lib/dates/jst";

export const dynamic = "force-dynamic";

export async function GET() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "ログインが必要です。" } }, { status: 401 });
	}

	const backup = await createBackupExport();

	return new NextResponse(backupToCsv(backup), {
		headers: {
			"Content-Disposition": `attachment; filename="facility-manual-backup-${formatJstDate()}.csv"`,
			"Content-Type": "text/csv; charset=utf-8",
		},
	});
}
