import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type CloudflareEnvWithD1 = CloudflareEnv & {
	DB?: D1Database;
};

type VisitorCountRow = {
	count: number;
};

async function getDatabase(): Promise<D1Database> {
	const { env } = await getCloudflareContext({ async: true });
	const db = (env as CloudflareEnvWithD1).DB;

	if (!db) {
		throw new Error("Missing required Cloudflare D1 binding: DB");
	}

	return db;
}

export async function getVisitorCountFromD1(): Promise<number> {
	const db = await getDatabase();
	const row = await db
		.prepare("SELECT count FROM visitor_count WHERE id = ?")
		.bind(1)
		.first<VisitorCountRow>();

	return row?.count ?? 0;
}

export async function incrementVisitorCountInD1(): Promise<number> {
	const db = await getDatabase();
	const row = await db
		.prepare(`
      UPDATE visitor_count
      SET count = count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING count
    `)
		.bind(1)
		.first<VisitorCountRow>();

	if (!row) {
		throw new Error("Missing visitor_count row with id=1");
	}

	return row.count;
}
