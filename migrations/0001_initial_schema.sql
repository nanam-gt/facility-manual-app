PRAGMA foreign_keys = ON;

CREATE TABLE administrators (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL,
	display_name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE admin_sessions (
	id TEXT PRIMARY KEY,
	administrator_id TEXT NOT NULL,
	token_hash TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL,
	last_used_at TEXT,
	revoked_at TEXT,
	FOREIGN KEY (administrator_id) REFERENCES administrators(id) ON DELETE CASCADE
);

CREATE TABLE areas (
	id TEXT PRIMARY KEY,
	code TEXT,
	name TEXT NOT NULL,
	short_name TEXT,
	description TEXT,
	color_key TEXT,
	display_order INTEGER NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE timings (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	description TEXT,
	display_order INTEGER NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE manuals (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	slug TEXT NOT NULL,
	area_id TEXT NOT NULL,
	timing_id TEXT NOT NULL,
	summary TEXT,
	preparation TEXT,
	tools TEXT,
	chemicals TEXT,
	target_staff TEXT,
	frequency TEXT,
	duration_mode TEXT NOT NULL DEFAULT 'hidden' CHECK (duration_mode IN ('manual', 'steps_sum', 'hidden')),
	duration_min_minutes INTEGER,
	duration_max_minutes INTEGER,
	duration_note TEXT,
	general_warning TEXT,
	completion_note TEXT,
	search_keywords TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
	display_order INTEGER NOT NULL,
	published_at TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	deleted_at TEXT,
	FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE RESTRICT,
	FOREIGN KEY (timing_id) REFERENCES timings(id) ON DELETE RESTRICT
);

CREATE TABLE manual_steps (
	id TEXT PRIMARY KEY,
	manual_id TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT,
	warning TEXT,
	completion_criteria TEXT,
	tools TEXT,
	duration_minutes INTEGER,
	duration_note TEXT,
	image_object_key TEXT,
	image_alt TEXT,
	image_width INTEGER,
	image_height INTEGER,
	image_mime_type TEXT,
	display_order INTEGER NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	deleted_at TEXT,
	FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE
);

CREATE TABLE manual_relations (
	manual_id TEXT NOT NULL,
	related_manual_id TEXT NOT NULL,
	display_order INTEGER NOT NULL,
	PRIMARY KEY (manual_id, related_manual_id),
	FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
	FOREIGN KEY (related_manual_id) REFERENCES manuals(id) ON DELETE CASCADE,
	CHECK (manual_id != related_manual_id)
);

CREATE UNIQUE INDEX idx_administrators_email
ON administrators(email);

CREATE INDEX idx_sessions_token
ON admin_sessions(token_hash);

CREATE INDEX idx_sessions_expiry
ON admin_sessions(expires_at);

CREATE UNIQUE INDEX idx_manuals_slug
ON manuals(slug);

CREATE INDEX idx_manuals_public_filter
ON manuals(status, area_id, timing_id, display_order);

CREATE INDEX idx_manuals_deleted_at
ON manuals(deleted_at);

CREATE INDEX idx_manual_steps_manual
ON manual_steps(manual_id, display_order);

CREATE INDEX idx_manual_steps_deleted_at
ON manual_steps(deleted_at);
