import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AppCloudflareEnv = CloudflareEnv & {
	SESSION_SECRET?: string;
	INITIAL_ADMIN_EMAIL?: string;
	INITIAL_ADMIN_PASSWORD?: string;
};

export async function getEnv(): Promise<AppCloudflareEnv> {
	const { env } = await getCloudflareContext({ async: true });
	return env as AppCloudflareEnv;
}

export async function getDb(): Promise<D1Database> {
	const env = await getEnv();

	if (!env.DB) {
		throw new Error("Cloudflare D1 binding `DB` is not available.");
	}

	return env.DB;
}
