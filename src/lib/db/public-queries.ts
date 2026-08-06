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

export type PublicManualBook = {
	title: string;
	scopeLabel: string;
	manuals: PublicManualDetail[];
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

export async function listPublicTimingSummariesByArea(areaId: string): Promise<PublicTimingSummary[]> {
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
				AND manuals.area_id = ?
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
			WHERE timings.is_active = 1
			GROUP BY timings.id
			ORDER BY timings.display_order ASC, timings.name ASC
			`,
		)
		.bind(areaId)
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

export async function getPublicTiming(timingId: string): Promise<PublicTimingSummary | null> {
	const db = await getDb();
	const row = await db
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
			WHERE timings.id = ?
				AND timings.is_active = 1
			GROUP BY timings.id
			`,
		)
		.bind(timingId)
		.first<TimingRow>();

	if (!row) {
		return null;
	}

	return {
		id: row.id,
		name: row.name,
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

export async function listPublicManualsByTiming(timingId: string): Promise<PublicManualListItem[]> {
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
			WHERE manuals.timing_id = ?
				AND manuals.status = 'published'
				AND manuals.deleted_at IS NULL
				AND areas.is_active = 1
				AND timings.is_active = 1
			ORDER BY areas.display_order ASC, manuals.display_order ASC, manuals.title ASC
			`,
		)
		.bind(timingId)
		.all<ManualListRow>();

	return results.map(mapManualListRow);
}

export async function searchPublicManuals(params: {
	q?: string;
	timingId?: string;
	areaId?: string;
	page?: number;
	limit?: number;
}): Promise<PublicManualListItem[]> {
	const db = await getDb();
	const q = params.q?.trim() ?? "";
	const likeQuery = `%${q}%`;
	const hasQuery = q.length > 0;
	const limit = clampInteger(params.limit ?? 50, 1, 100);
	const page = clampInteger(params.page ?? 1, 1, 1000);
	const offset = (page - 1) * limit;

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
			LIMIT ?
			OFFSET ?
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
			limit,
			offset,
		)
		.all<ManualListRow>();

	return results.map(mapManualListRow);
}

function clampInteger(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) {
		return min;
	}

	return Math.min(Math.max(Math.trunc(value), min), max);
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

export async function getPublicManualBook(params: {
	title?: string;
	areaId?: string;
	timingId?: string;
	manualIds?: string[];
}): Promise<PublicManualBook> {
	const db = await getDb();
	const manualIds = params.manualIds?.filter(Boolean).slice(0, 100) ?? [];
	const filters = [
		"manuals.status = 'published'",
		"manuals.deleted_at IS NULL",
		"areas.is_active = 1",
		"timings.is_active = 1",
	];
	const binds: string[] = [];

	if (params.areaId) {
		filters.push("manuals.area_id = ?");
		binds.push(params.areaId);
	}

	if (params.timingId) {
		filters.push("manuals.timing_id = ?");
		binds.push(params.timingId);
	}

	if (manualIds.length > 0) {
		filters.push(`manuals.id IN (${manualIds.map(() => "?").join(", ")})`);
		binds.push(...manualIds);
	}

	const { results: manualRows } = await db
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
			WHERE ${filters.join("\n\t\t\t\tAND ")}
			ORDER BY areas.display_order ASC, timings.display_order ASC, manuals.display_order ASC, manuals.title ASC
			LIMIT 100
			`,
		)
		.bind(...binds)
		.all<ManualDetailRow>();

	if (manualRows.length === 0) {
		return {
			title: params.title?.trim() || "施設管理マニュアル",
			scopeLabel: "該当マニュアルなし",
			manuals: [],
		};
	}

	const stepBinds = manualRows.map((manual) => manual.id);
	const { results: stepRows } = await db
		.prepare(
			`
			SELECT
				id,
				manual_id,
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
			WHERE deleted_at IS NULL
				AND manual_id IN (${stepBinds.map(() => "?").join(", ")})
			ORDER BY manual_id ASC, display_order ASC, title ASC
			`,
		)
		.bind(...stepBinds)
		.all<ManualStepRow & { manual_id: string }>();

	const stepsByManual = new Map<string, ManualStepRow[]>();
	for (const step of stepRows) {
		const steps = stepsByManual.get(step.manual_id) ?? [];
		steps.push(step);
		stepsByManual.set(step.manual_id, steps);
	}

	const manuals = manualRows.map((manual) => ({
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
		steps: (stepsByManual.get(manual.id) ?? []).map(mapManualStepRow),
	}));

	return {
		title: params.title?.trim() || "施設管理マニュアル",
		scopeLabel: createBookScopeLabel(manuals),
		manuals,
	};
}

function createBookScopeLabel(manuals: PublicManualDetail[]): string {
	const areas = Array.from(new Set(manuals.map((manual) => manual.areaName)));
	const timings = Array.from(new Set(manuals.map((manual) => manual.timingName)));

	if (areas.length === 1 && timings.length === 1) {
		return `${areas[0]} / ${timings[0]}`;
	}

	if (areas.length === 1) {
		return areas[0];
	}

	if (timings.length === 1) {
		return timings[0];
	}

	return "全体";
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
