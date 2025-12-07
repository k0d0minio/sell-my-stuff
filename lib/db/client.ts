import { sql } from "@vercel/postgres";

/**
 * Database client utilities for the second-hand store.
 * Uses Vercel Postgres for database operations.
 */

/**
 * Execute a SQL query and return the result.
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T = unknown>(
	queryText: string,
	params?: unknown[],
): Promise<T[]> {
	try {
		const result = await sql.query(queryText, params);
		return result.rows as T[];
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	}
}

/**
 * Execute a SQL query and return a single row.
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Single row or null
 */
export async function queryOne<T = unknown>(
	queryText: string,
	params?: unknown[],
): Promise<T | null> {
	const results = await query<T>(queryText, params);
	return results[0] ?? null;
}

/**
 * Initialize the database schema.
 * This should be run once to set up the database tables.
 */
export async function initializeDatabase(): Promise<void> {
	try {
		// Read and execute schema.sql
		const { readFileSync } = await import("fs");
		const { join } = await import("path");
		const schemaPath = join(process.cwd(), "lib/db/schema.sql");
		const schema = readFileSync(schemaPath, "utf-8");

		// Execute each statement separately
		const statements = schema
			.split(";")
			.map((s) => s.trim())
			.filter((s) => s.length > 0 && !s.startsWith("--"));

		for (const statement of statements) {
			if (statement.trim()) {
				await sql.query(statement);
			}
		}

		console.log("Database schema initialized successfully");
	} catch (error) {
		console.error("Failed to initialize database schema:", error);
		throw error;
	}
}

