import { getDb } from "@/lib/db/client";
import { generateId } from "@/lib/auth/crypto";

export type AdminManualListItem = {
	id: string;
	title: string;
	slug: string;
	status: string;
	areaName: string;
	timingName: string;
	updatedAt: string;
};

export type AdminManualOption = {
	id: string;
	name: string;
};

export type CreateManualInput = {
	title: string;
	slug?: string;
	areaId: string;
	timingId: string;
	summary?: string;
	status: "draft" | "published" | "private";
};

export async function listAdminManuals(): Promise<AdminManualListItem[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				manuals.id,
				manuals.title,
				manuals.slug,
				manuals.status,
				areas.name AS area_name,
				timings.name AS timing_name,
				manuals.updated_at
			FROM manuals
			INNER JOIN areas ON areas.id = manuals.area_id
			INNER JOIN timings ON timings.id = manuals.timing_id
			WHERE manuals.deleted_at IS NULL
			ORDER BY manuals.updated_at DESC, manuals.display_order ASC
			`,
		)
		.all<{
			id: string;
			title: string;
			slug: string;
			status: string;
			area_name: string;
			timing_name: string;
			updated_at: string;
		}>();

	return results.map((manual) => ({
		id: manual.id,
		title: manual.title,
		slug: manual.slug,
		status: manual.status,
		areaName: manual.area_name,
		timingName: manual.timing_name,
		updatedAt: manual.updated_at,
	}));
}

export async function getManualFormOptions(): Promise<{
	areas: AdminManualOption[];
	timings: AdminManualOption[];
}> {
	const db = await getDb();
	const [areas, timings] = await Promise.all([
		db
			.prepare(
				`
				SELECT id, name
				FROM areas
				WHERE is_active = 1
				ORDER BY display_order ASC, name ASC
				`,
			)
			.all<AdminManualOption>(),
		db
			.prepare(
				`
				SELECT id, name
				FROM timings
				WHERE is_active = 1
				ORDER BY display_order ASC, name ASC
				`,
			)
			.all<AdminManualOption>(),
	]);

	return {
		areas: areas.results,
		timings: timings.results,
	};
}

export async function createManual(input: CreateManualInput): Promise<string> {
	const db = await getDb();
	const now = new Date().toISOString();
	const slug = await createUniqueSlug(input.slug || input.title);
	const id = generateId("manual");
	const displayOrder = await getNextManualDisplayOrder(input.areaId, input.timingId);

	await db
		.prepare(
			`
			INSERT INTO manuals (
				id,
				title,
				slug,
				area_id,
				timing_id,
				summary,
				duration_mode,
				status,
				display_order,
				published_at,
				created_at,
				updated_at,
				deleted_at
			) VALUES (?, ?, ?, ?, ?, ?, 'hidden', ?, ?, ?, ?, ?, NULL)
			`,
		)
		.bind(
			id,
			input.title,
			slug,
			input.areaId,
			input.timingId,
			input.summary || null,
			input.status,
			displayOrder,
			input.status === "published" ? now : null,
			now,
			now,
		)
		.run();

	return slug;
}

async function createUniqueSlug(value: string): Promise<string> {
	const db = await getDb();
	const baseSlug = toSlug(value) || `manual-${crypto.randomUUID().slice(0, 8)}`;
	let candidate = baseSlug;
	let suffix = 2;

	while (await slugExists(candidate)) {
		candidate = `${baseSlug}-${suffix}`;
		suffix += 1;
	}

	async function slugExists(slug: string): Promise<boolean> {
		const row = await db.prepare("SELECT id FROM manuals WHERE slug = ? LIMIT 1").bind(slug).first<{ id: string }>();
		return Boolean(row);
	}

	return candidate;
}

function toSlug(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 80);
}

async function getNextManualDisplayOrder(areaId: string, timingId: string): Promise<number> {
	const db = await getDb();
	const row = await db
		.prepare(
			`
			SELECT COALESCE(MAX(display_order), 0) + 10 AS next_order
			FROM manuals
			WHERE area_id = ?
				AND timing_id = ?
				AND deleted_at IS NULL
			`,
		)
		.bind(areaId, timingId)
		.first<{ next_order: number }>();

	return row?.next_order ?? 10;
}
