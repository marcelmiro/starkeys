// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.js`-file to be imported there.
 */
const { z } = require('zod')

const numeric = z.string().regex(/\d+/).transform(Number)

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production']),
	BASE_URL: z
		.string()
		.url()
		.refine((url) => url.endsWith('/')),
	DATABASE_URL: z.string().url(),
	NOTION_SECRET: z.string().min(1),
	NOTION_DATABASE_ID: z.string().min(1),
	REFERRAL_CODE_LENGTH: numeric.refine((n) => n > 0),
	MAX_REFERREES: numeric.refine((n) => n > 0),
	MAILGUN_API_KEY: z.string().min(1),
	MAILGUN_DOMAIN: z.string().min(1),
	MAILGUN_FROM_ADDRESS: z.string().min(1),
	NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY: z.string().min(1),
	NEXT_PUBLIC_UPLOADCARE_BASE_URL: z
		.string()
		.url()
		.refine((url) => url.endsWith('/')),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
	console.error(
		'Invalid environment variables:',
		JSON.stringify(env.error.format(), null, 4)
	)
	process.exit(1)
}
