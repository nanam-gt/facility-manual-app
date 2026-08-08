import { getEnv } from "@/lib/db/client";
import type { ActiveCompletionReport } from "@/lib/db/completion-reports";

type CompletionEmailInput = {
	report: ActiveCompletionReport;
	manual: {
		title: string;
		areaName: string;
		timingName: string;
		slug: string;
	};
	origin: string;
};

export async function notifyCompletionReport(input: CompletionEmailInput): Promise<void> {
	const env = await getEnv();
	const to = env.COMPLETION_NOTIFY_EMAIL?.trim();
	const from = env.COMPLETION_NOTIFY_FROM?.trim();

	if (!env.NOTIFY_EMAIL || !to || !from) {
		console.warn("Completion notification email skipped: email binding or address is not configured.");
		return;
	}

	const reportedAt = formatJstDateTime(input.report.reportedAt);
	const manualUrl = `${input.origin}/manuals/${input.manual.slug}`;
	const text = [
		"完了報告が送信されました。",
		"",
		`マニュアル: ${input.manual.title}`,
		`エリア: ${input.manual.areaName}`,
		`タイミング: ${input.manual.timingName}`,
		`報告者: ${input.report.reporterName}`,
		`報告日時: ${reportedAt}`,
		`URL: ${manualUrl}`,
	].join("\n");

	await env.NOTIFY_EMAIL.send({
		from,
		to,
		subject: `完了報告: ${input.manual.title}`,
		text,
	});
}

function formatJstDateTime(value: string): string {
	return new Intl.DateTimeFormat("ja-JP", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
