import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { cancelCompletionReport, createCompletionReport } from "@/lib/db/completion-reports";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

	const formData = await request.formData();
	const action = text(formData, "action");
	const manualId = text(formData, "manualId");
	const reporterId = text(formData, "reporterId");

	if (!manualId || !reporterId || !["complete", "cancel"].includes(action)) {
		return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
	}

	try {
		if (action === "cancel") {
			const canceled = await cancelCompletionReport(manualId, reporterId);
			if (!canceled) {
				return NextResponse.json({ error: "取り消しできる完了報告がありません。" }, { status: 400 });
			}

			return NextResponse.json({ activeReport: null });
		}

		const activeReport = await createCompletionReport(manualId, reporterId);
		return NextResponse.json({ activeReport });
	} catch (error) {
		console.error("Completion report failed", error);
		return NextResponse.json({ error: "完了報告に失敗しました。" }, { status: 500 });
	}
}

function text(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "").trim();
}
