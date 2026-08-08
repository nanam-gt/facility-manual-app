import { getDb } from "@/lib/db/client";

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type AdminCompletionReportStats = {
	activeReports: number;
	todayReports: number;
	canceledReports: number;
	totalReports: number;
};

export type AdminCompletionReport = {
	id: string;
	manualId: string;
	manualTitle: string;
	manualSlug: string;
	areaName: string;
	timingName: string;
	reporterName: string;
	reportedAt: string;
	canceledAt: string | null;
	canceledByName: string | null;
	isActive: boolean;
};

type CountRow = {
	count: number;
};

type ReportRow = {
	id: string;
	manual_id: string;
	manual_title: string;
	manual_slug: string;
	area_name: string;
	timing_name: string;
	reporter_name: string;
	reported_at: string;
	canceled_at: string | null;
	canceled_by_name: string | null;
};

export async function getAdminCompletionReportSummary(now = new Date()): Promise<AdminCompletionReportStats> {
	const db = await getDb();
	const activeThreshold = new Date(now.getTime() - ACTIVE_WINDOW_MS).toISOString();
	const todayStart = getJstDayStartIso(now);

	const [activeReports, todayReports, canceledReports, totalReports] = await Promise.all([
		db
			.prepare(
				`
				SELECT COUNT(*) AS count
				FROM manual_completion_reports
				WHERE canceled_at IS NULL
					AND reported_at >= ?
				`,
			)
			.bind(activeThreshold)
			.first<CountRow>(),
		db
			.prepare(
				`
				SELECT COUNT(*) AS count
				FROM manual_completion_reports
				WHERE reported_at >= ?
				`,
			)
			.bind(todayStart)
			.first<CountRow>(),
		db
			.prepare(
				`
				SELECT COUNT(*) AS count
				FROM manual_completion_reports
				WHERE canceled_at IS NOT NULL
				`,
			)
			.first<CountRow>(),
		db.prepare("SELECT COUNT(*) AS count FROM manual_completion_reports").first<CountRow>(),
	]);

	return {
		activeReports: activeReports?.count ?? 0,
		todayReports: todayReports?.count ?? 0,
		canceledReports: canceledReports?.count ?? 0,
		totalReports: totalReports?.count ?? 0,
	};
}

export async function listAdminCompletionReports(now = new Date()): Promise<AdminCompletionReport[]> {
	const db = await getDb();
	const activeThreshold = new Date(now.getTime() - ACTIVE_WINDOW_MS).toISOString();
	const { results } = await db
		.prepare(
			`
			SELECT
				reports.id,
				reports.manual_id,
				manuals.title AS manual_title,
				manuals.slug AS manual_slug,
				areas.name AS area_name,
				timings.name AS timing_name,
				reports.reporter_name,
				reports.reported_at,
				reports.canceled_at,
				reports.canceled_by_name
			FROM manual_completion_reports reports
			INNER JOIN manuals ON manuals.id = reports.manual_id
			INNER JOIN areas ON areas.id = reports.area_id
			INNER JOIN timings ON timings.id = reports.timing_id
			ORDER BY reports.reported_at DESC
			LIMIT 100
			`,
		)
		.all<ReportRow>();

	return results.map((report) => ({
		id: report.id,
		manualId: report.manual_id,
		manualTitle: report.manual_title,
		manualSlug: report.manual_slug,
		areaName: report.area_name,
		timingName: report.timing_name,
		reporterName: report.reporter_name,
		reportedAt: report.reported_at,
		canceledAt: report.canceled_at,
		canceledByName: report.canceled_by_name,
		isActive: !report.canceled_at && report.reported_at >= activeThreshold,
	}));
}

function getJstDayStartIso(date: Date): string {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
	const utcTime = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), -9, 0, 0, 0);

	return new Date(utcTime).toISOString();
}
