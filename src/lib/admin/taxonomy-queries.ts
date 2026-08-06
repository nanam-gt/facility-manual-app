import { getDb } from "@/lib/db/client";
import { generateId } from "@/lib/auth/crypto";

export type AdminArea = {
	id: string;
	code: string | null;
	name: string;
	shortName: string | null;
	description: string | null;
	colorKey: string | null;
	displayOrder: number;
	isActive: boolean;
	manualCount: number;
};

export type AdminTiming = {
	id: string;
	name: string;
	description: string | null;
	displayOrder: number;
	isActive: boolean;
	manualCount: number;
};

export type UpsertAreaInput = {
	id?: string;
	code?: string;
	name: string;
	shortName?: string;
	description?: string;
	colorKey?: string;
	displayOrder?: number;
	isActive: boolean;
};

export type UpsertTimingInput = {
	id?: string;
	name: string;
	description?: string;
	displayOrder?: number;
	isActive: boolean;
};

export async function listAdminAreas(): Promise<AdminArea[]> {
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
				areas.color_key,
				areas.display_order,
				areas.is_active,
				COUNT(manuals.id) AS manual_count
			FROM areas
			LEFT JOIN manuals
				ON manuals.area_id = areas.id
				AND manuals.deleted_at IS NULL
			GROUP BY areas.id
			ORDER BY areas.display_order ASC, areas.name ASC
			`,
		)
		.all<{
			id: string;
			code: string | null;
			name: string;
			short_name: string | null;
			description: string | null;
			color_key: string | null;
			display_order: number;
			is_active: number;
			manual_count: number;
		}>();

	return results.map((area) => ({
		id: area.id,
		code: area.code,
		name: area.name,
		shortName: area.short_name,
		description: area.description,
		colorKey: area.color_key,
		displayOrder: area.display_order,
		isActive: area.is_active === 1,
		manualCount: area.manual_count,
	}));
}

export async function listAdminTimings(): Promise<AdminTiming[]> {
	const db = await getDb();
	const { results } = await db
		.prepare(
			`
			SELECT
				timings.id,
				timings.name,
				timings.description,
				timings.display_order,
				timings.is_active,
				COUNT(manuals.id) AS manual_count
			FROM timings
			LEFT JOIN manuals
				ON manuals.timing_id = timings.id
				AND manuals.deleted_at IS NULL
			GROUP BY timings.id
			ORDER BY timings.display_order ASC, timings.name ASC
			`,
		)
		.all<{
			id: string;
			name: string;
			description: string | null;
			display_order: number;
			is_active: number;
			manual_count: number;
		}>();

	return results.map((timing) => ({
		id: timing.id,
		name: timing.name,
		description: timing.description,
		displayOrder: timing.display_order,
		isActive: timing.is_active === 1,
		manualCount: timing.manual_count,
	}));
}

export async function upsertArea(input: UpsertAreaInput): Promise<void> {
	const db = await getDb();
	const now = new Date().toISOString();
	const id = input.id || generateId("area");

	await db
		.prepare(
			`
			INSERT INTO areas (
				id,
				code,
				name,
				short_name,
				description,
				color_key,
				display_order,
				is_active,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				code = excluded.code,
				name = excluded.name,
				short_name = excluded.short_name,
				description = excluded.description,
				color_key = excluded.color_key,
				display_order = excluded.display_order,
				is_active = excluded.is_active,
				updated_at = excluded.updated_at
			`,
		)
		.bind(
			id,
			nullable(input.code),
			input.name,
			nullable(input.shortName),
			nullable(input.description),
			nullable(input.colorKey),
			input.displayOrder ?? 0,
			input.isActive ? 1 : 0,
			now,
			now,
		)
		.run();
}

export async function upsertTiming(input: UpsertTimingInput): Promise<void> {
	const db = await getDb();
	const now = new Date().toISOString();
	const id = input.id || generateId("timing");

	await db
		.prepare(
			`
			INSERT INTO timings (
				id,
				name,
				description,
				display_order,
				is_active,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				description = excluded.description,
				display_order = excluded.display_order,
				is_active = excluded.is_active,
				updated_at = excluded.updated_at
			`,
		)
		.bind(
			id,
			input.name,
			nullable(input.description),
			input.displayOrder ?? 0,
			input.isActive ? 1 : 0,
			now,
			now,
		)
		.run();
}

export async function deleteAreaIfUnused(id: string): Promise<"deleted" | "in_use" | "not_found"> {
	const db = await getDb();
	const area = await db
		.prepare(
			`
			SELECT areas.id, COUNT(manuals.id) AS manual_count
			FROM areas
			LEFT JOIN manuals
				ON manuals.area_id = areas.id
				AND manuals.deleted_at IS NULL
			WHERE areas.id = ?
			GROUP BY areas.id
			`,
		)
		.bind(id)
		.first<{ id: string; manual_count: number }>();

	if (!area) {
		return "not_found";
	}

	if (area.manual_count > 0) {
		return "in_use";
	}

	await db.prepare("DELETE FROM areas WHERE id = ?").bind(id).run();

	return "deleted";
}

export async function deleteTimingIfUnused(id: string): Promise<"deleted" | "in_use" | "not_found"> {
	const db = await getDb();
	const timing = await db
		.prepare(
			`
			SELECT timings.id, COUNT(manuals.id) AS manual_count
			FROM timings
			LEFT JOIN manuals
				ON manuals.timing_id = timings.id
				AND manuals.deleted_at IS NULL
			WHERE timings.id = ?
			GROUP BY timings.id
			`,
		)
		.bind(id)
		.first<{ id: string; manual_count: number }>();

	if (!timing) {
		return "not_found";
	}

	if (timing.manual_count > 0) {
		return "in_use";
	}

	await db.prepare("DELETE FROM timings WHERE id = ?").bind(id).run();

	return "deleted";
}

function nullable(value: string | undefined | null): string | null {
	const trimmed = value?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : null;
}
