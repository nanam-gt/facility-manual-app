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

export type AdminManualStepInput = {
	title: string;
	description?: string;
	warning?: string;
	completionCriteria?: string;
	tools?: string;
	durationMinutes?: number | null;
	imageObjectKey?: string | null;
	imageAlt?: string | null;
	imageWidth?: number | null;
	imageHeight?: number | null;
	imageMimeType?: string | null;
};

export type AdminManualEdit = {
	id: string;
	title: string;
	slug: string;
	areaId: string;
	timingId: string;
	summary: string | null;
	preparation: string | null;
	tools: string | null;
	chemicals: string | null;
	targetStaff: string | null;
	frequency: string | null;
	durationMode: string;
	durationMinMinutes: number | null;
	durationMaxMinutes: number | null;
	durationNote: string | null;
	generalWarning: string | null;
	completionNote: string | null;
	searchKeywords: string | null;
	status: "draft" | "published" | "private";
	steps: Array<AdminManualStepInput & { id: string }>;
};

export type CreateManualInput = {
	title: string;
	slug?: string;
	areaId: string;
	timingId: string;
	summary?: string;
	status: "draft" | "published" | "private";
};

export type UpdateManualInput = CreateManualInput & {
	id: string;
	preparation?: string;
	tools?: string;
	chemicals?: string;
	targetStaff?: string;
	frequency?: string;
	durationMode: "manual" | "steps_sum" | "hidden";
	durationMinMinutes?: number | null;
	durationMaxMinutes?: number | null;
	durationNote?: string;
	generalWarning?: string;
	completionNote?: string;
	searchKeywords?: string;
	steps: AdminManualStepInput[];
};

export type AdminManualListFilters = {
	q?: string;
	status?: string;
	areaId?: string;
	timingId?: string;
};

export async function listAdminManuals(filters: AdminManualListFilters = {}): Promise<AdminManualListItem[]> {
	const db = await getDb();
	const q = filters.q?.trim() ?? "";
	const where = ["manuals.deleted_at IS NULL"];
	const binds: Array<string | number> = [];

	if (filters.status && ["draft", "published", "private"].includes(filters.status)) {
		where.push("manuals.status = ?");
		binds.push(filters.status);
	}

	if (filters.areaId) {
		where.push("manuals.area_id = ?");
		binds.push(filters.areaId);
	}

	if (filters.timingId) {
		where.push("manuals.timing_id = ?");
		binds.push(filters.timingId);
	}

	if (q) {
		const likeQuery = `%${q}%`;
		where.push(`
			(
				manuals.title LIKE ?
				OR manuals.slug LIKE ?
				OR manuals.summary LIKE ?
				OR manuals.search_keywords LIKE ?
				OR areas.name LIKE ?
				OR timings.name LIKE ?
			)
		`);
		binds.push(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery);
	}

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
			WHERE ${where.join("\n\t\t\t\tAND ")}
			ORDER BY manuals.updated_at DESC, manuals.display_order ASC
			LIMIT 100
			`,
		)
		.bind(...binds)
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

export async function getAdminManualForEdit(id: string): Promise<AdminManualEdit | null> {
	const db = await getDb();
	const manual = await db
		.prepare(
			`
			SELECT
				id,
				title,
				slug,
				area_id,
				timing_id,
				summary,
				preparation,
				tools,
				chemicals,
				target_staff,
				frequency,
				duration_mode,
				duration_min_minutes,
				duration_max_minutes,
				duration_note,
				general_warning,
				completion_note,
				search_keywords,
				status
			FROM manuals
			WHERE id = ?
				AND deleted_at IS NULL
			LIMIT 1
			`,
		)
		.bind(id)
		.first<{
			id: string;
			title: string;
			slug: string;
			area_id: string;
			timing_id: string;
			summary: string | null;
			preparation: string | null;
			tools: string | null;
			chemicals: string | null;
			target_staff: string | null;
			frequency: string | null;
			duration_mode: string;
			duration_min_minutes: number | null;
			duration_max_minutes: number | null;
			duration_note: string | null;
			general_warning: string | null;
			completion_note: string | null;
			search_keywords: string | null;
			status: "draft" | "published" | "private";
		}>();

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
				image_object_key,
				image_alt,
				image_width,
				image_height,
				image_mime_type
			FROM manual_steps
			WHERE manual_id = ?
				AND deleted_at IS NULL
			ORDER BY display_order ASC, title ASC
			`,
		)
		.bind(id)
		.all<{
			id: string;
			title: string;
			description: string | null;
			warning: string | null;
			completion_criteria: string | null;
			tools: string | null;
			duration_minutes: number | null;
			image_object_key: string | null;
			image_alt: string | null;
			image_width: number | null;
			image_height: number | null;
			image_mime_type: string | null;
		}>();

	return {
		id: manual.id,
		title: manual.title,
		slug: manual.slug,
		areaId: manual.area_id,
		timingId: manual.timing_id,
		summary: manual.summary,
		preparation: manual.preparation,
		tools: manual.tools,
		chemicals: manual.chemicals,
		targetStaff: manual.target_staff,
		frequency: manual.frequency,
		durationMode: manual.duration_mode,
		durationMinMinutes: manual.duration_min_minutes,
		durationMaxMinutes: manual.duration_max_minutes,
		durationNote: manual.duration_note,
		generalWarning: manual.general_warning,
		completionNote: manual.completion_note,
		searchKeywords: manual.search_keywords,
		status: manual.status,
		steps: steps.map((step) => ({
			id: step.id,
			title: step.title,
			description: step.description ?? "",
			warning: step.warning ?? "",
			completionCriteria: step.completion_criteria ?? "",
			tools: step.tools ?? "",
			durationMinutes: step.duration_minutes,
			imageObjectKey: step.image_object_key,
			imageAlt: step.image_alt,
			imageWidth: step.image_width,
			imageHeight: step.image_height,
			imageMimeType: step.image_mime_type,
		})),
	};
}

export async function updateManual(input: UpdateManualInput): Promise<string> {
	const db = await getDb();
	const now = new Date().toISOString();
	const existing = await db.prepare("SELECT slug FROM manuals WHERE id = ? LIMIT 1").bind(input.id).first<{ slug: string }>();

	if (!existing) {
		throw new Error("Manual not found.");
	}

	const requestedSlug = toSlug(input.slug || input.title) || existing.slug;
	const slug = await createUniqueSlug(requestedSlug, input.id);

	const statements = [
		db
			.prepare(
				`
				UPDATE manuals
				SET
					title = ?,
					slug = ?,
					area_id = ?,
					timing_id = ?,
					summary = ?,
					preparation = ?,
					tools = ?,
					chemicals = ?,
					target_staff = ?,
					frequency = ?,
					duration_mode = ?,
					duration_min_minutes = ?,
					duration_max_minutes = ?,
					duration_note = ?,
					general_warning = ?,
					completion_note = ?,
					search_keywords = ?,
					status = ?,
					published_at = CASE
						WHEN ? = 'published' AND published_at IS NULL THEN ?
						WHEN ? != 'published' THEN NULL
						ELSE published_at
					END,
					updated_at = ?
				WHERE id = ?
				`,
			)
			.bind(
				input.title,
				slug,
				input.areaId,
				input.timingId,
				nullable(input.summary),
				nullable(input.preparation),
				nullable(input.tools),
				nullable(input.chemicals),
				nullable(input.targetStaff),
				nullable(input.frequency),
				input.durationMode,
				input.durationMode === "manual" ? input.durationMinMinutes : null,
				input.durationMode === "manual" ? input.durationMaxMinutes : null,
				nullable(input.durationNote),
				nullable(input.generalWarning),
				nullable(input.completionNote),
				nullable(input.searchKeywords),
				input.status,
				input.status,
				now,
				input.status,
				now,
				input.id,
			),
		db.prepare("DELETE FROM manual_steps WHERE manual_id = ?").bind(input.id),
	];

	input.steps
		.filter((step) => step.title.trim().length > 0)
		.forEach((step, index) => {
			statements.push(
				db
					.prepare(
						`
						INSERT INTO manual_steps (
							id,
							manual_id,
							title,
							description,
							warning,
							completion_criteria,
							tools,
							duration_minutes,
							image_object_key,
							image_alt,
							image_width,
							image_height,
							image_mime_type,
							display_order,
							created_at,
							updated_at,
							deleted_at
						) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
						`,
					)
					.bind(
						generateId("step"),
						input.id,
						step.title.trim(),
						nullable(step.description),
						nullable(step.warning),
						nullable(step.completionCriteria),
						nullable(step.tools),
						step.durationMinutes ?? null,
						step.imageObjectKey ?? null,
						step.imageAlt ?? null,
						step.imageWidth ?? null,
						step.imageHeight ?? null,
						step.imageMimeType ?? null,
						(index + 1) * 10,
						now,
						now,
					),
			);
		});

	await db.batch(statements);
	return slug;
}

export async function duplicateManual(id: string): Promise<string> {
	const db = await getDb();
	const source = await getAdminManualForEdit(id);

	if (!source) {
		throw new Error("Manual not found.");
	}

	const now = new Date().toISOString();
	const newId = generateId("manual");
	const title = `${source.title} コピー`;
	const slug = await createUniqueSlug(`${source.slug}-copy`);
	const displayOrder = await getNextManualDisplayOrder(source.areaId, source.timingId);
	const statements: D1PreparedStatement[] = [
		db
			.prepare(
				`
				INSERT INTO manuals (
					id,
					title,
					slug,
					area_id,
					timing_id,
					summary,
					preparation,
					tools,
					chemicals,
					target_staff,
					frequency,
					duration_mode,
					duration_min_minutes,
					duration_max_minutes,
					duration_note,
					general_warning,
					completion_note,
					search_keywords,
					status,
					display_order,
					published_at,
					created_at,
					updated_at,
					deleted_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NULL, ?, ?, NULL)
				`,
			)
			.bind(
				newId,
				title,
				slug,
				source.areaId,
				source.timingId,
				source.summary,
				source.preparation,
				source.tools,
				source.chemicals,
				source.targetStaff,
				source.frequency,
				source.durationMode,
				source.durationMinMinutes,
				source.durationMaxMinutes,
				source.durationNote,
				source.generalWarning,
				source.completionNote,
				source.searchKeywords,
				displayOrder,
				now,
				now,
			),
	];

	source.steps.forEach((step, index) => {
		statements.push(
			db
				.prepare(
					`
					INSERT INTO manual_steps (
						id,
						manual_id,
						title,
						description,
						warning,
						completion_criteria,
						tools,
						duration_minutes,
						image_object_key,
						image_alt,
						image_width,
						image_height,
						image_mime_type,
						display_order,
						created_at,
						updated_at,
						deleted_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
					`,
				)
				.bind(
					generateId("step"),
					newId,
					step.title,
					nullable(step.description),
					nullable(step.warning),
					nullable(step.completionCriteria),
					nullable(step.tools),
					step.durationMinutes ?? null,
					step.imageObjectKey ?? null,
					step.imageAlt ?? null,
					step.imageWidth ?? null,
					step.imageHeight ?? null,
					step.imageMimeType ?? null,
					(index + 1) * 10,
					now,
					now,
				),
		);
	});

	await db.batch(statements);
	return slug;
}

export async function softDeleteManual(id: string): Promise<void> {
	const db = await getDb();
	const now = new Date().toISOString();

	await db
		.prepare(
			`
			UPDATE manuals
			SET deleted_at = ?,
				updated_at = ?,
				status = 'private'
			WHERE id = ?
				AND deleted_at IS NULL
			`,
		)
		.bind(now, now, id)
		.run();
}

async function createUniqueSlug(value: string, currentManualId?: string): Promise<string> {
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
		if (currentManualId && row?.id === currentManualId) {
			return false;
		}
		return Boolean(row);
	}

	return candidate;
}

function nullable(value: string | undefined | null): string | null {
	const trimmed = value?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : null;
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
