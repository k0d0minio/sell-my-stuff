# Second Hand Store

A personal second-hand marketplace application built with Next.js. Browse and purchase second-hand items with a simple, modern interface. Built with TypeScript, Tailwind CSS, shadcn/ui, and comprehensive developer tooling.

## Features

- 🛍️ **Item Management** - Browse, search, and filter second-hand items by category
- 📸 **Image Uploads** - Upload and manage item images with Supabase storage
- 📝 **Reservations** - Contact form for item reservations and inquiries
- 🔐 **Admin Panel** - Secure admin area for managing items and viewing reservations
- ⚡ **Next.js 16** - Latest App Router with React Server Components
- 🎨 **shadcn/ui** - Beautiful, accessible component library
- 🎭 **Framer Motion** - Smooth animations and transitions
- 📧 **Contact Forms** - Resend integration for email handling
- 🧪 **Vitest** - Fast unit and integration testing with React Testing Library
- 📊 **Vercel Analytics** - Built-in analytics and speed insights
- 🔍 **Production-Grade SEO** - Structured data (JSON-LD), comprehensive metadata, dynamic sitemap, verification tags, and PWA manifest
- 🐛 **Error Handling** - Automatic error reporting to Linear with deduplication
- 🎯 **TypeScript** - Full type safety
- 🎨 **Tailwind CSS v4** - Modern utility-first styling
- 🛠️ **Developer Experience** - Biome for linting and formatting, comprehensive testing setup

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd website-starter
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_EMAIL_TO=contact@yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Linear Error Reporting (Production only)
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_TEAM_ID=your-team-id-or-name
LINEAR_ERROR_LABEL=bugs  # Optional: label to apply to error issues
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── contact/       # Contact form endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── robots.ts          # Robots.txt
│   └── sitemap.ts         # Sitemap generation
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── contact-form.tsx  # Contact form component
│   ├── header.tsx        # Site header
│   ├── footer.tsx        # Site footer
│   ├── hero-section.tsx  # Hero section
│   ├── feature-grid.tsx  # Features grid
│   └── cta-section.tsx   # Call-to-action section
├── lib/                  # Utility functions
│   ├── utils.ts          # Utility functions (cn helper)
│   ├── metadata.ts       # Metadata utilities
│   ├── seo/              # SEO utilities
│   │   └── structured-data.ts  # JSON-LD schema generators
│   └── validations/      # Zod validation schemas
├── tests/                # Test files
│   ├── setup.tsx         # Test setup and mocks
│   ├── integration/      # Integration tests
│   └── *.test.tsx        # Component and utility tests
└── .github/              # GitHub workflows and templates (if applicable)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Fix linting errors and format code with Biome
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:ui` - Run Vitest tests in UI mode
- `npm run test:coverage` - Run tests with coverage report

## Configuration

### Resend Email Setup

1. Sign up for a [Resend](https://resend.com) account
2. Create an API key in the Resend dashboard
3. Add your API key to `.env.local` as `RESEND_API_KEY`
4. Configure `RESEND_FROM_EMAIL` and `RESEND_EMAIL_TO`

### Vercel Analytics

Vercel Analytics and Speed Insights are automatically enabled when deployed to Vercel. No additional configuration needed.

### Linear Error Reporting

The template includes automatic error reporting to Linear for production errors:

1. **Client-side errors**: Caught by React Error Boundaries and global error handlers
2. **Server-side errors**: Caught in API routes and server components
3. **Error deduplication**: Similar errors are grouped into the same Linear issue
4. **User-friendly error pages**: Users see friendly error messages while errors are reported in the background

To enable:

1. Create a Linear API key in your Linear workspace settings
2. Get your team ID or team name from Linear
3. Add the environment variables to your production environment:
   - `LINEAR_API_KEY` - Your Linear API key
   - `LINEAR_TEAM_ID` - Your Linear team ID or team name
   - `LINEAR_ERROR_LABEL` (optional) - Label to apply to error issues

Error reporting only works in production (`NODE_ENV=production`). Errors in development are logged to the console only.

### shadcn/ui Components

Add new components using the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

See the [shadcn/ui documentation](https://ui.shadcn.com) for available components.

### SEO Configuration

This template includes production-grade SEO features:

#### Structured Data (JSON-LD)

The template automatically generates structured data for:
- **Organization Schema** - Business/website identity
- **WebSite Schema** - Website information with search action support
- **BreadcrumbList Schema** - Navigation breadcrumbs (per-page)

Structured data is automatically injected into pages. To customize:

```typescript
// In your page component
import { createOrganizationSchema } from "@/lib/seo/structured-data";

const organizationSchema = createOrganizationSchema({
  name: "Your Organization",
  url: "https://yourdomain.com",
  logo: "https://yourdomain.com/logo.png",
  sameAs: ["https://twitter.com/yourhandle", "https://linkedin.com/company/yourcompany"]
});
```

#### Metadata Configuration

All SEO metadata is configured via environment variables. The `createMetadata()` helper function allows easy page-specific overrides:

```typescript
// In app/your-page/page.tsx
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Your Page Title",
  description: "Your page description",
  openGraph: {
    title: "Your OG Title",
    description: "Your OG Description",
    images: [{ url: "https://yourdomain.com/og-image.jpg" }],
  },
});
```

#### Sitemap

The sitemap is automatically generated from routes defined in `app/sitemap.ts`. Add new routes to the `staticRoutes` array:

```typescript
const staticRoutes: SitemapRoute[] = [
  {
    url: baseUrl,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${baseUrl}/about`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
];
```

#### Search Engine Verification

Add verification codes to your `.env.local`:
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Google Search Console
- `NEXT_PUBLIC_BING_VERIFICATION` - Bing Webmaster Tools
- `NEXT_PUBLIC_YANDEX_VERIFICATION` - Yandex Webmaster

#### PWA Manifest

The template includes a PWA manifest (`app/manifest.ts`) that's automatically generated. Ensure you have the following icon files in your `public` directory:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico`

## Testing

This project uses [Vitest](https://vitest.dev) for unit and integration testing with [React Testing Library](https://testing-library.com/react) for component testing.

### Running Tests

Run all tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in UI mode:

```bash
npm run test:ui
```

### Writing Tests

Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions, or in the `tests/` directory for integration tests. See the existing test files for examples.

The test setup includes:
- React Testing Library for component testing
- jsdom environment for DOM testing
- Next.js router and Image component mocks
- Coverage thresholds: 80% statements, 70% branches, 80% functions, 80% lines

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy!

The project includes a GitHub Actions workflow for automatic deployment.

### Other Platforms

This project can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- AWS Amplify
- Cloudflare Pages

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for email functionality |
| `RESEND_FROM_EMAIL` | Email address to send from |
| `RESEND_EMAIL_TO` | Email address to send to |

### Site Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your site's URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Site name | `Website Starter` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description | Template default |
| `NEXT_PUBLIC_SITE_KEYWORDS` | Comma-separated keywords | Template defaults |
| `NEXT_PUBLIC_SITE_LOCALE` | Site locale (e.g., `en_US`) | `en_US` |

### SEO Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification code |
| `NEXT_PUBLIC_BING_VERIFICATION` | Bing Webmaster Tools verification code |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Yandex Webmaster verification code |
| `NEXT_PUBLIC_THEME_COLOR` | Theme color for mobile browsers | `#000000` |
| `NEXT_PUBLIC_OG_IMAGE_URL` | Open Graph image URL |

### Social Media

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_TWITTER_HANDLE` | Twitter/X handle (e.g., `@username`) |

### Author & Organization

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_AUTHOR_NAME` | Author name |
| `NEXT_PUBLIC_CREATOR_NAME` | Creator name |
| `NEXT_PUBLIC_ORGANIZATION_NAME` | Organization name (for structured data) |
| `NEXT_PUBLIC_ORGANIZATION_URL` | Organization website URL |
| `NEXT_PUBLIC_ORGANIZATION_LOGO` | Organization logo URL |
| `NEXT_PUBLIC_BUSINESS_NAME` | Business name (optional, falls back to site name) |

### Error Reporting (Production Only)

| Variable | Description |
|----------|-------------|
| `LINEAR_API_KEY` | Linear API key for error reporting |
| `LINEAR_TEAM_ID` | Linear team ID or team name where errors will be created |
| `LINEAR_ERROR_LABEL` | Optional label to apply to error issues |

## Contributing

Contributions are welcome! Please ensure your code:
- Passes all tests (`npm run test`)
- Passes linting (`npm run lint`)
- Follows TypeScript best practices
- Includes tests for new features

## License

This project is open source and available under the [MIT License](LICENSE).

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Vitest Documentation](https://vitest.dev)
- [Biome Documentation](https://biomejs.dev)
- [Resend Documentation](https://resend.com/docs)

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
