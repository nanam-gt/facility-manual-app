import { getDb } from "@/lib/db/client";

export type PublicAreaSummary = {
	id: string;
	code: string | null;
	name: string;
	shortName: string | null;
	description: string | null;
	manualCount: number;
};

export type PublicTimingSummary = {
	id: string;
	name: string;
	description: string | null;
	manualCount: number;
};

export type RecentManualSummary = {
	id: string;
	title: string;
	slug: string;
	areaName: string;
	timingName: string;
	updatedAt: string;
};

type AreaRow = {
	id: string;
	code: string | null;
	name: string;
	short_name: string | null;
	description: string | null;
	manual_count: number;
};

type TimingRow = {
	id: string;
	name: string;
	description: string | null;
	manual_count: number;
};

type RecentManualRow = {
	id: string;
	title: string;
	slug: string;
	area_name: string;
	timing_name: string;
	updated_at: string;
};

export async function listPublicAreaSummaries(): Promise<PublicAreaSummary[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				areas.id,
				areas.code,
				areas.name,
				areas.short_name,
				areas.description,
				COUNT(manuals.id) AS manual_count
			FROM areas
			LEFT JOIN manuals
				ON manuals.area_id = areas.id
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
			WHERE areas.is_active = 1
			GROUP BY areas.id
			ORDER BY areas.display_order ASC, areas.name ASC
			`,
		)
		.all<AreaRow>();

	return results.map((row) => ({
		id: row.id,
		code: row.code,
		name: row.name,
		shortName: row.short_name,
		description: row.description,
		manualCount: row.manual_count,
	}));
}

export async function listPublicTimingSummaries(): Promise<PublicTimingSummary[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				timings.id,
				timings.name,
				timings.description,
				COUNT(manuals.id) AS manual_count
			FROM timings
			LEFT JOIN manuals
				ON manuals.timing_id = timings.id
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
			WHERE timings.is_active = 1
			GROUP BY timings.id
			ORDER BY timings.display_order ASC, timings.name ASC
			`,
		)
		.all<TimingRow>();

	return results.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		manualCount: row.manual_count,
	}));
}

export async function listRecentPublicManuals(limit = 5): Promise<RecentManualSummary[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				manuals.id,
				manuals.title,
				manuals.slug,
				areas.name AS area_name,
				timings.name AS timing_name,
				manuals.updated_at
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			WHERE manuals.status = 'published'
				AND manuals.deleted_at IS NULL
				AND areas.is_active = 1
				AND timings.is_active = 1
			ORDER BY manuals.updated_at DESC
			LIMIT ?
			`,
		)
		.bind(limit)
		.all<RecentManualRow>();

	return results.map((row) => ({
		id: row.id,
		title: row.title,
		slug: row.slug,
		areaName: row.area_name,
		timingName: row.timing_name,
		updatedAt: row.updated_at,
	}));
}

export async function getPublicHomeData() {
	const [areas, timings, recentManuals] = await Promise.all([
		listPublicAreaSummaries(),
		listPublicTimingSummaries(),
		listRecentPublicManuals(),
	]);

	return {
		areas,
		timings,
		recentManuals,
	};
}
