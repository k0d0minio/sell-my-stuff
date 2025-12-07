import { cookies } from "next/headers";
import { verifyPassword, getAdminPasswordHash } from "./password";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me-in-production";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a session token (simple implementation using bcrypt hash of timestamp + secret).
 * In production, consider using a more secure token generation method.
 */
function createSessionToken(): string {
	const timestamp = Date.now().toString();
	return Buffer.from(`${timestamp}-${SESSION_SECRET}`).toString("base64");
}

/**
 * Verify a session token.
 */
function verifySessionToken(token: string): boolean {
	try {
		const decoded = Buffer.from(token, "base64").toString("utf-8");
		const [timestamp, secret] = decoded.split("-");

		if (secret !== SESSION_SECRET) {
			return false;
		}

		const tokenTime = Number.parseInt(timestamp, 10);
		const now = Date.now();

		// Check if session is expired
		if (now - tokenTime > SESSION_DURATION) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Create a new admin session.
 * @param password - Plain text password to verify
 * @returns True if login successful, false otherwise
 */
export async function createSession(
	password: string,
): Promise<boolean> {
	try {
		const hash = getAdminPasswordHash();

		// If hash doesn't start with $2a$ or $2b$, it's a plain password
		const isValid =
			hash.startsWith("$2a$") || hash.startsWith("$2b$")
				? await verifyPassword(password, hash)
				: password === hash;

		if (isValid) {
			const token = createSessionToken();
			const cookieStore = await cookies();
			cookieStore.set(SESSION_COOKIE_NAME, token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: SESSION_DURATION / 1000, // Convert to seconds
				path: "/",
			});
			return true;
		}

		return false;
	} catch (error) {
		console.error("Session creation error:", error);
		return false;
	}
}

/**
 * Check if the current request has a valid admin session.
 * @returns True if session is valid, false otherwise
 */
export async function hasValidSession(): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

		if (!token) {
			return false;
		}

		return verifySessionToken(token);
	} catch {
		return false;
	}
}

/**
 * Destroy the current admin session (logout).
 */
export async function destroySession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}

