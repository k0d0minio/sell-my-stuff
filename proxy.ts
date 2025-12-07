import { type NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip handling for API routes, static files, and other excluded paths
	const isExcludedPath =
		pathname.startsWith("/api/") ||
		pathname.startsWith("/_next/") ||
		pathname.startsWith("/favicon.ico") ||
		/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(
			pathname,
		);

	if (isExcludedPath) {
		return NextResponse.next();
	}

	const response = NextResponse.next();

	// Security headers
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Permissions-Policy: Disable camera, microphone, geolocation, interest-cohort
	response.headers.set(
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=(), interest-cohort=()",
	);

	// Content-Security-Policy
	const isDevelopment = process.env.NODE_ENV === "development";

	// Base CSP directives
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-insights.com *.vercel-analytics.com",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self' data:",
		"connect-src 'self' *.vercel-insights.com *.vercel-analytics.com",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
	];

	// In production, remove 'unsafe-eval' for stricter security
	if (!isDevelopment) {
		const cspDirectivesProduction = cspDirectives.map((directive) => {
			if (directive.startsWith("script-src")) {
				return directive.replace(" 'unsafe-eval'", "");
			}
			return directive;
		});
		response.headers.set(
			"Content-Security-Policy",
			cspDirectivesProduction.join("; "),
		);
	} else {
		response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
	}

	// Strict-Transport-Security: Only in production
	if (process.env.NODE_ENV === "production") {
		response.headers.set(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		);
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files with extensions (images, etc.)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)).*)",
	],
};
