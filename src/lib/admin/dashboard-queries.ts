import { getDb } from "@/lib/db/client";

export type AdminDashboardStats = {
	publishedManuals: number;
	draftManuals: number;
	privateManuals: number;
	areas: number;
	timings: number;
};

export type AdminRecentManual = {
	id: string;
	title: string;
	status: string;
	areaName: string;
	timingName: string;
	updatedAt: string;
};

export async function getAdminDashboardData(): Promise<{
	stats: AdminDashboardStats;
	recentManuals: AdminRecentManual[];
}> {
	const db = await getDb();
	const [publishedManuals, draftManuals, privateManuals, areas, timings, recentManuals] = await Promise.all([
		countManualsByStatus("published"),
		countManualsByStatus("draft"),
		countManualsByStatus("private"),
		db.prepare("SELECT COUNT(*) AS count FROM areas WHERE is_active = 1").first<{ count: number }>(),
		db.prepare("SELECT COUNT(*) AS count FROM timings WHERE is_active = 1").first<{ count: number }>(),
		db
			.prepare(
				`
				SELECT
					manuals.id,
					manuals.title,
					manuals.status,
					areas.name AS area_name,
					timings.name AS timing_name,
					manuals.updated_at
				FROM manuals
				INNER JOIN areas ON areas.id = manuals.area_id
				INNER JOIN timings ON timings.id = manuals.timing_id
				WHERE manuals.deleted_at IS NULL
				ORDER BY manuals.updated_at DESC
				LIMIT 8
				`,
			)
			.all<{
				id: string;
				title: string;
				status: string;
				area_name: string;
				timing_name: string;
				updated_at: string;
			}>(),
	]);

	return {
		stats: {
			publishedManuals: publishedManuals?.count ?? 0,
			draftManuals: draftManuals?.count ?? 0,
			privateManuals: privateManuals?.count ?? 0,
			areas: areas?.count ?? 0,
			timings: timings?.count ?? 0,
		},
		recentManuals: recentManuals.results.map((manual) => ({
			id: manual.id,
			title: manual.title,
			status: manual.status,
			areaName: manual.area_name,
			timingName: manual.timing_name,
			updatedAt: manual.updated_at,
		})),
	};
}

async function countManualsByStatus(status: string): Promise<{ count: number } | null> {
	const db = await getDb();
	return db
		.prepare(
			`
			SELECT COUNT(*) AS count
			FROM manuals
			WHERE status = ?
				AND deleted_at IS NULL
			`,
		)
		.bind(status)
		.first<{ count: number }>();
}
