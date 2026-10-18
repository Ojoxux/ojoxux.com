type VisitorCountRow = {
	count: number;
};

export async function incrementVisitorCount(db: D1Database): Promise<number> {
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
