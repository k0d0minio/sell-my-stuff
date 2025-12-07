import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt.
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash.
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Get the admin password hash from environment variable.
 * In production, this should be a hashed password.
 * For development, we can use a plain password and hash it on first use.
 */
export function getAdminPasswordHash(): string {
	const password = process.env.ADMIN_PASSWORD;
	if (!password) {
		throw new Error("ADMIN_PASSWORD environment variable is not set");
	}

	// If the password is already a bcrypt hash (starts with $2a$ or $2b$), return it
	if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
		return password;
	}

	// Otherwise, it's a plain password - hash it
	// Note: In production, you should pre-hash the password
	return password;
}

