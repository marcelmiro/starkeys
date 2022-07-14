// src/utils/trpc.ts
import type { AppRouter } from '../server/router'
import { createReactQueryHooks, TRPCClientErrorLike } from '@trpc/react'

export const trpc = createReactQueryHooks<AppRouter>()

/**
 * Check out tRPC docs for Inference Helpers
 * https://trpc.io/docs/infer-types#inference-helpers
 */

export function parseErrorMessage(
	error?: TRPCClientErrorLike<AppRouter> | null
) {
	if (!error) return
	try {
		return JSON.parse(error.message)[0]?.message as string | undefined
	} catch (e) {
		return error.message
	}
}
