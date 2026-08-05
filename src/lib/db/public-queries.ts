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

export type PublicManualListItem = RecentManualSummary & {
	summary: string | null;
	durationMinMinutes: number | null;
	durationMaxMinutes: number | null;
	durationNote: string | null;
};

export type PublicManualStep = {
	id: string;
	title: string;
	description: string | null;
	warning: string | null;
	completionCriteria: string | null;
	tools: string | null;
	durationMinutes: number | null;
	durationNote: string | null;
	imageObjectKey: string | null;
	imageAlt: string | null;
};

export type PublicManualDetail = PublicManualListItem & {
	preparation: string | null;
	tools: string | null;
	chemicals: string | null;
	targetStaff: string | null;
	frequency: string | null;
	durationMode: string;
	generalWarning: string | null;
	completionNote: string | null;
	publishedAt: string | null;
	steps: PublicManualStep[];
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

type ManualListRow = RecentManualRow & {
	summary: string | null;
	duration_min_minutes: number | null;
	duration_max_minutes: number | null;
	duration_note: string | null;
};

type ManualDetailRow = ManualListRow & {
	preparation: string | null;
	tools: string | null;
	chemicals: string | null;
	target_staff: string | null;
	frequency: string | null;
	duration_mode: string;
	general_warning: string | null;
	completion_note: string | null;
	published_at: string | null;
};

type ManualStepRow = {
	id: string;
	title: string;
	description: string | null;
	warning: string | null;
	completion_criteria: string | null;
	tools: string | null;
	duration_minutes: number | null;
	duration_note: string | null;
	image_object_key: string | null;
	image_alt: string | null;
};

function mapManualListRow(row: ManualListRow): PublicManualListItem {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		areaName: row.area_name,
		timingName: row.timing_name,
		updatedAt: row.updated_at,
		summary: row.summary,
		durationMinMinutes: row.duration_min_minutes,
		durationMaxMinutes: row.duration_max_minutes,
		durationNote: row.duration_note,
	};
}

function mapManualStepRow(row: ManualStepRow): PublicManualStep {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		warning: row.warning,
		completionCriteria: row.completion_criteria,
		tools: row.tools,
		durationMinutes: row.duration_minutes,
		durationNote: row.duration_note,
		imageObjectKey: row.image_object_key,
		imageAlt: row.image_alt,
	};
}

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

export async function getPublicArea(areaId: string): Promise<PublicAreaSummary | null> {
	const db = await getDb();
	const row = await db
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
			WHERE areas.id = ?
				AND areas.is_active = 1
			GROUP BY areas.id
			`,
		)
		.bind(areaId)
		.first<AreaRow>();

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		code: row.code,
		name: row.name,
		shortName: row.short_name,
		description: row.description,
		manualCount: row.manual_count,
	};
}

export async function listPublicManualsByArea(areaId: string): Promise<PublicManualListItem[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				manuals.id,
				manuals.title,
				manuals.slug,
				manuals.summary,
				manuals.duration_min_minutes,
				manuals.duration_max_minutes,
				manuals.duration_note,
				areas.name AS area_name,
				timings.name AS timing_name,
				manuals.updated_at
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			WHERE manuals.area_id = ?
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
				AND areas.is_active = 1
				AND timings.is_active = 1
			ORDER BY timings.display_order ASC, manuals.display_order ASC, manuals.title ASC
			`,
		)
		.bind(areaId)
		.all<ManualListRow>();

	return results.map(mapManualListRow);
}

export async function searchPublicManuals(params: {
	q?: string;
	timingId?: string;
	areaId?: string;
}): Promise<PublicManualListItem[]> {
	const db = await getDb();
	const q = params.q?.trim() ?? "";
	const likeQuery = `%${q}%`;
	const hasQuery = q.length > 0;

	const { results } = await db
		.prepare(
			`
			SELECT DISTINCT
				manuals.id,
				manuals.title,
				manuals.slug,
				manuals.summary,
				manuals.duration_min_minutes,
				manuals.duration_max_minutes,
				manuals.duration_note,
				areas.name AS area_name,
				timings.name AS timing_name,
				manuals.updated_at
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			LEFT JOIN manual_steps ON manual_steps.manual_id = manuals.id
				AND manual_steps.deleted_at IS NULL
			WHERE manuals.status = 'published'
				AND manuals.deleted_at IS NULL
				AND areas.is_active = 1
				AND timings.is_active = 1
				AND (? = '' OR manuals.area_id = ?)
				AND (? = '' OR manuals.timing_id = ?)
				AND (
					? = 0
					OR manuals.title LIKE ?
					OR manuals.summary LIKE ?
					OR manuals.preparation LIKE ?
					OR manuals.tools LIKE ?
					OR manuals.chemicals LIKE ?
					OR manuals.search_keywords LIKE ?
					OR areas.name LIKE ?
					OR timings.name LIKE ?
					OR manual_steps.title LIKE ?
					OR manual_steps.description LIKE ?
					OR manual_steps.warning LIKE ?
					OR manual_steps.completion_criteria LIKE ?
				)
			ORDER BY manuals.updated_at DESC, manuals.display_order ASC
			LIMIT 50
			`,
		)
		.bind(
			params.areaId ?? "",
			params.areaId ?? "",
			params.timingId ?? "",
			params.timingId ?? "",
			hasQuery ? 1 : 0,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
			likeQuery,
		)
		.all<ManualListRow>();

	return results.map(mapManualListRow);
}

export async function getPublicManualBySlug(slug: string): Promise<PublicManualDetail | null> {
	const db = await getDb();
	const manual = await db
		.prepare(
			`
			SELECT
				manuals.id,
				manuals.title,
				manuals.slug,
				manuals.summary,
				manuals.preparation,
				manuals.tools,
				manuals.chemicals,
				manuals.target_staff,
				manuals.frequency,
				manuals.duration_mode,
				manuals.duration_min_minutes,
				manuals.duration_max_minutes,
				manuals.duration_note,
				manuals.general_warning,
				manuals.completion_note,
				manuals.published_at,
				areas.name AS area_name,
				timings.name AS timing_name,
				manuals.updated_at
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			WHERE manuals.slug = ?
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
				AND areas.is_active = 1
				AND timings.is_active = 1
			`,
		)
		.bind(slug)
		.first<ManualDetailRow>();

	if (!manual) {
		return null;
	}

	const { results: steps } = await db
		.prepare(
			`
			SELECT
				id,
				title,
				description,
				warning,
				completion_criteria,
				tools,
				duration_minutes,
				duration_note,
				image_object_key,
				image_alt
			FROM manual_steps
			WHERE manual_id = ?
				AND deleted_at IS NULL
			ORDER BY display_order ASC, title ASC
			`,
		)
		.bind(manual.id)
		.all<ManualStepRow>();

	return {
		...mapManualListRow(manual),
		preparation: manual.preparation,
		tools: manual.tools,
		chemicals: manual.chemicals,
		targetStaff: manual.target_staff,
		frequency: manual.frequency,
		durationMode: manual.duration_mode,
		generalWarning: manual.general_warning,
		completionNote: manual.completion_note,
		publishedAt: manual.published_at,
		steps: steps.map(mapManualStepRow),
	};
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
