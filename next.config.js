const path = require('path')
const loaderUtils = require('loader-utils')

// Based on https://tinyurl.com/next-config-js
function getCssModuleLocalIdent(context, _, exportName, options) {
	const relativePath = path
		.relative(context.rootContext, context.resourcePath)
		.replace(/\\+/g, '/')

	const buffer = Buffer.from(
		`filePath:${relativePath}#className:${exportName}`
	)

	const hash = loaderUtils.getHashDigest(buffer, 'md5', 'base64', 6)

	return loaderUtils
		.interpolateName(context, hash, options)
		.replace(/\.module_/, '_')
		.replace(/[^a-zA-Z0-9-_]/g, '_')
		.replace(/^(\d|--|-\d)/, '__$1')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	images: {
		formats: ['image/avif', 'image/webp'],
		domains: [],
	},
	webpack(config, { dev }) {
		// SVGR config
		config.module.rules.push({
			test: /\.svg$/,
			use: [
				{
					loader: '@svgr/webpack',
					options: {
						svgoConfig: {
							plugins: [
								{
									name: 'preset-default',
									params: {
										overrides: {
											cleanupIDs: false,
											prefixIds: false,
										},
									},
								},
							],
						},
					},
				},
			],
		})

		// Hash class names in production
		if (!dev) {
			const rules = config.module.rules
				.find((rule) => typeof rule.oneOf === 'object')
				.oneOf.filter((rule) => Array.isArray(rule.use))

			rules.forEach((rule) => {
				rule.use.forEach((moduleLoader) => {
					if (
						moduleLoader.loader?.includes('css-loader') &&
						!moduleLoader.loader.includes('postcss-loader')
					) {
						moduleLoader.options.modules.getLocalIdent =
							getCssModuleLocalIdent
					}
				})
			})
		}

		return config
	},
}

module.exports = nextConfig
