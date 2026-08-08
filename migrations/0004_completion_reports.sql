CREATE TABLE completion_reporters (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT,
	display_order INTEGER NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	deleted_at TEXT
);

CREATE TABLE manual_completion_reports (
	id TEXT PRIMARY KEY,
	manual_id TEXT NOT NULL,
	area_id TEXT NOT NULL,
	timing_id TEXT NOT NULL,
	reporter_id TEXT NOT NULL,
	reporter_name TEXT NOT NULL,
	reported_at TEXT NOT NULL,
	canceled_at TEXT,
	canceled_by_reporter_id TEXT,
	canceled_by_name TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
	FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE RESTRICT,
	FOREIGN KEY (timing_id) REFERENCES timings(id) ON DELETE RESTRICT,
	FOREIGN KEY (reporter_id) REFERENCES completion_reporters(id) ON DELETE RESTRICT,
	FOREIGN KEY (canceled_by_reporter_id) REFERENCES completion_reporters(id) ON DELETE RESTRICT
);

CREATE INDEX idx_completion_reporters_active
ON completion_reporters(is_active, display_order);

CREATE INDEX idx_completion_reports_manual_active
ON manual_completion_reports(manual_id, canceled_at, reported_at);

CREATE INDEX idx_completion_reports_reporter
ON manual_completion_reports(reporter_id, reported_at);

INSERT INTO completion_reporters (
	id,
	name,
	email,
	display_order,
	is_active,
	created_at,
	updated_at,
	deleted_at
) VALUES (
	'reporter_default_staff',
	'スタッフ',
	NULL,
	10,
	1,
	'2026-08-08T00:00:00.000Z',
	'2026-08-08T00:00:00.000Z',
	NULL
);
