import { getDb } from "@/lib/db/client";

type ExportRow = Record<string, string | number | null>;

export type BackupExport = {
	exportedAt: string;
	version: 1;
	data: {
		areas: ExportRow[];
		timings: ExportRow[];
		manuals: ExportRow[];
		manualSteps: ExportRow[];
		manualRelations: ExportRow[];
	};
};

const tableQueries = {
	areas: `
		SELECT *
		FROM areas
		ORDER BY display_order ASC, name ASC
	`,
	timings: `
		SELECT *
		FROM timings
		ORDER BY display_order ASC, name ASC
	`,
	manuals: `
		SELECT *
		FROM manuals
		ORDER BY updated_at DESC, display_order ASC
	`,
	manualSteps: `
		SELECT *
		FROM manual_steps
		ORDER BY manual_id ASC, display_order ASC
	`,
	manualRelations: `
		SELECT *
		FROM manual_relations
		ORDER BY manual_id ASC, display_order ASC
	`,
};

export async function createBackupExport(): Promise<BackupExport> {
	const db = await getDb();
	const [areas, timings, manuals, manualSteps, manualRelations] = await Promise.all([
		db.prepare(tableQueries.areas).all<ExportRow>(),
		db.prepare(tableQueries.timings).all<ExportRow>(),
		db.prepare(tableQueries.manuals).all<ExportRow>(),
		db.prepare(tableQueries.manualSteps).all<ExportRow>(),
		db.prepare(tableQueries.manualRelations).all<ExportRow>(),
	]);

	return {
		exportedAt: new Date().toISOString(),
		version: 1,
		data: {
			areas: areas.results,
			timings: timings.results,
			manuals: manuals.results,
			manualSteps: manualSteps.results,
			manualRelations: manualRelations.results,
		},
	};
}

export function backupToCsv(backup: BackupExport): string {
	const sections: string[] = [];

	for (const [name, rows] of Object.entries(backup.data)) {
		sections.push(`# ${name}`);
		sections.push(rowsToCsv(rows));
		sections.push("");
	}

	return sections.join("\n");
}

function rowsToCsv(rows: ExportRow[]): string {
	if (rows.length === 0) {
		return "";
	}

	const headers = Object.keys(rows[0]);
	const lines = [headers.map(escapeCsvCell).join(",")];

	for (const row of rows) {
		lines.push(headers.map((header) => escapeCsvCell(row[header])).join(","));
	}

	return lines.join("\n");
}

function escapeCsvCell(value: string | number | null | undefined): string {
	if (value === null || value === undefined) {
		return "";
	}

	const raw = String(value);
	if (!/[",\n\r]/.test(raw)) {
		return raw;
	}

	return `"${raw.replaceAll('"', '""')}"`;
}
