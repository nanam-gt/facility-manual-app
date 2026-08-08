import { generateId } from "@/lib/auth/crypto";
import { getDb } from "@/lib/db/client";

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type CompletionReporter = {
	id: string;
	name: string;
};

export type ActiveCompletionReport = {
	id: string;
	manualId: string;
	reporterId: string;
	reporterName: string;
	reportedAt: string;
	expiresAt: string;
};

type ReporterRow = {
	id: string;
	name: string;
};

type ManualRow = {
	id: string;
	title: string;
	area_id: string;
	area_name: string;
	timing_id: string;
	timing_name: string;
	slug: string;
};

type CompletionReportRow = {
	id: string;
	manual_id: string;
	reporter_id: string;
	reporter_name: string;
	reported_at: string;
};

export async function listCompletionReporters(): Promise<CompletionReporter[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT id, name
			FROM completion_reporters
			WHERE is_active = 1
				AND deleted_at IS NULL
			ORDER BY display_order ASC, name ASC
			`,
		)
		.all<ReporterRow>();

	return results.map((reporter) => ({
		id: reporter.id,
		name: reporter.name,
	}));
}

export async function getActiveCompletionReport(manualId: string, now = new Date()): Promise<ActiveCompletionReport | null> {
	const db = await getDb();
	const threshold = new Date(now.getTime() - ACTIVE_WINDOW_MS).toISOString();
	const row = await db
		.prepare(
			`
			SELECT
				id,
				manual_id,
				reporter_id,
				reporter_name,
				reported_at
			FROM manual_completion_reports
			WHERE manual_id = ?
				AND canceled_at IS NULL
				AND reported_at >= ?
			ORDER BY reported_at DESC
			LIMIT 1
			`,
		)
		.bind(manualId, threshold)
		.first<CompletionReportRow>();

	return row ? mapActiveReport(row) : null;
}

export async function createCompletionReport(manualId: string, reporterId: string): Promise<ActiveCompletionReport> {
	const db = await getDb();
	const existingReport = await getActiveCompletionReport(manualId);
	if (existingReport) {
		return existingReport;
	}

	const [manual, reporter] = await Promise.all([findPublishedManual(manualId), findReporter(reporterId)]);

	if (!manual) {
		throw new Error("Manual not found.");
	}

	if (!reporter) {
		throw new Error("Reporter not found.");
	}

	const now = new Date().toISOString();
	const id = generateId("completion");

	await db
		.prepare(
			`
			INSERT INTO manual_completion_reports (
				id,
				manual_id,
				area_id,
				timing_id,
				reporter_id,
				reporter_name,
				reported_at,
				canceled_at,
				canceled_by_reporter_id,
				canceled_by_name,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?)
			`,
		)
		.bind(id, manual.id, manual.area_id, manual.timing_id, reporter.id, reporter.name, now, now, now)
		.run();

	return {
		id,
		manualId: manual.id,
		reporterId: reporter.id,
		reporterName: reporter.name,
		reportedAt: now,
		expiresAt: new Date(Date.parse(now) + ACTIVE_WINDOW_MS).toISOString(),
	};
}

export async function getCompletionNotificationContext(manualId: string): Promise<{
	title: string;
	areaName: string;
	timingName: string;
	slug: string;
} | null> {
	const manual = await findPublishedManual(manualId);
	return manual
		? {
				title: manual.title,
				areaName: manual.area_name,
				timingName: manual.timing_name,
				slug: manual.slug,
			}
		: null;
}

export async function cancelCompletionReport(manualId: string, reporterId: string): Promise<ActiveCompletionReport | null> {
	const db = await getDb();
	const [activeReport, reporter] = await Promise.all([getActiveCompletionReport(manualId), findReporter(reporterId)]);

	if (!activeReport || !reporter || activeReport.reporterId !== reporter.id) {
		return null;
	}

	const now = new Date().toISOString();
	await db
		.prepare(
			`
			UPDATE manual_completion_reports
			SET canceled_at = ?,
				canceled_by_reporter_id = ?,
				canceled_by_name = ?,
				updated_at = ?
			WHERE id = ?
				AND canceled_at IS NULL
			`,
		)
		.bind(now, reporter.id, reporter.name, now, activeReport.id)
		.run();

	return activeReport;
}

async function findPublishedManual(manualId: string): Promise<ManualRow | null> {
	const db = await getDb();
	return db
		.prepare(
			`
			SELECT
				manuals.id,
				manuals.title,
				manuals.area_id,
				areas.name AS area_name,
				manuals.timing_id,
				timings.name AS timing_name,
				manuals.slug
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			WHERE manuals.id = ?
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
			LIMIT 1
			`,
		)
		.bind(manualId)
		.first<ManualRow>();
}

async function findReporter(reporterId: string): Promise<ReporterRow | null> {
	const db = await getDb();
	return db
		.prepare(
			`
			SELECT id, name
			FROM completion_reporters
			WHERE id = ?
				AND is_active = 1
				AND deleted_at IS NULL
			LIMIT 1
			`,
		)
		.bind(reporterId)
		.first<ReporterRow>();
}

function mapActiveReport(row: CompletionReportRow): ActiveCompletionReport {
	return {
		id: row.id,
		manualId: row.manual_id,
		reporterId: row.reporter_id,
		reporterName: row.reporter_name,
		reportedAt: row.reported_at,
		expiresAt: new Date(Date.parse(row.reported_at) + ACTIVE_WINDOW_MS).toISOString(),
	};
}
