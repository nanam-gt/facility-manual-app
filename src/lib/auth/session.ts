import { cookies } from "next/headers";
import { getDb, getEnv } from "@/lib/db/client";
import { generateId, generateToken, hashPassword, hashSessionToken, verifyPassword } from "@/lib/auth/crypto";

export const ADMIN_SESSION_COOKIE = "facility_admin_session";
const SESSION_DAYS = 14;

export type AuthenticatedAdmin = {
	id: string;
	email: string;
	displayName: string;
};

type AdministratorRow = {
	id: string;
	email: string;
	display_name: string;
	password_hash: string;
	is_active: number;
};

type SessionAdminRow = {
	session_id: string;
	administrator_id: string;
	email: string;
	display_name: string;
	expires_at: string;
	revoked_at: string | null;
};

export async function loginAdmin(email: string, password: string): Promise<{ token: string; expiresAt: Date } | null> {
	await ensureInitialAdmin();

	const db = await getDb();
	const admin = await db
		.prepare(
			`
			SELECT id, email, display_name, password_hash, is_active
			FROM administrators
			WHERE lower(email) = lower(?)
			LIMIT 1
			`,
		)
		.bind(email)
		.first<AdministratorRow>();

	if (!admin || admin.is_active !== 1) {
		return null;
	}

	const valid = await verifyPassword(password, admin.password_hash);
	if (!valid) {
		return null;
	}

	const env = await getEnv();
	const secret = requireSessionSecret(env.SESSION_SECRET);
	const token = generateToken();
	const tokenHash = await hashSessionToken(token, secret);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

	await db
		.prepare(
			`
			INSERT INTO admin_sessions (
				id,
				administrator_id,
				token_hash,
				expires_at,
				created_at,
				last_used_at,
				revoked_at
			) VALUES (?, ?, ?, ?, ?, ?, NULL)
			`,
		)
		.bind(generateId("session"), admin.id, tokenHash, expiresAt.toISOString(), now.toISOString(), now.toISOString())
		.run();

	return { token, expiresAt };
}

export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
	if (!token) {
		return null;
	}

	const env = await getEnv();
	const secret = requireSessionSecret(env.SESSION_SECRET);
	const tokenHash = await hashSessionToken(token, secret);
	const db = await getDb();
	const row = await db
		.prepare(
			`
			SELECT
				admin_sessions.id AS session_id,
				administrators.id AS administrator_id,
				administrators.email,
				administrators.display_name,
				admin_sessions.expires_at,
				admin_sessions.revoked_at
			FROM admin_sessions
			INNER JOIN administrators ON administrators.id = admin_sessions.administrator_id
			WHERE admin_sessions.token_hash = ?
				AND administrators.is_active = 1
			LIMIT 1
			`,
		)
		.bind(tokenHash)
		.first<SessionAdminRow>();

	if (!row || row.revoked_at || Date.parse(row.expires_at) <= Date.now()) {
		return null;
	}

	await db
		.prepare(
			`
			UPDATE admin_sessions
			SET last_used_at = ?
			WHERE id = ?
			`,
		)
		.bind(new Date().toISOString(), row.session_id)
		.run();

	return {
		id: row.administrator_id,
		email: row.email,
		displayName: row.display_name,
	};
}

export async function revokeCurrentSession(): Promise<void> {
	const cookieStore = await cookies();
	const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
	if (!token) {
		return;
	}

	const env = await getEnv();
	const secret = requireSessionSecret(env.SESSION_SECRET);
	const tokenHash = await hashSessionToken(token, secret);
	const db = await getDb();

	await db
		.prepare(
			`
			UPDATE admin_sessions
			SET revoked_at = ?
			WHERE token_hash = ?
				AND revoked_at IS NULL
			`,
		)
		.bind(new Date().toISOString(), tokenHash)
		.run();
}

export async function ensureInitialAdmin(): Promise<void> {
	const env = await getEnv();
	const email = env.INITIAL_ADMIN_EMAIL?.trim();
	const password = env.INITIAL_ADMIN_PASSWORD;

	if (!email || !password) {
		return;
	}

	const db = await getDb();
	const existing = await db.prepare("SELECT COUNT(*) AS count FROM administrators").first<{ count: number }>();
	if (existing && existing.count > 0) {
		return;
	}

	const now = new Date().toISOString();
	const passwordHash = await hashPassword(password);

	await db
		.prepare(
			`
			INSERT INTO administrators (
				id,
				email,
				display_name,
				password_hash,
				is_active,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, 1, ?, ?)
			`,
		)
		.bind(generateId("admin"), email, "管理者", passwordHash, now, now)
		.run();
}

function requireSessionSecret(secret: string | undefined): string {
	if (!secret || secret.length < 32 || secret === "replace-with-a-long-random-secret") {
		throw new Error("SESSION_SECRET must be set to at least 32 random characters.");
	}

	return secret;
}
