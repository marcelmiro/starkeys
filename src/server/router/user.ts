import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

import { createRouter } from './context'
import { verifyReferralCode } from '../db/utils'
import { insertUserToNotion } from '../notion/utils'
import { generateId } from '../../utils/id'
import { sendSubmissionEmail } from '../email/utils'

const BASE_URL = process.env.BASE_URL as string
const REFERRAL_CODE_LENGTH = Number(process.env.REFERRAL_CODE_LENGTH)
const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 7 * 31

export const userRouter = createRouter()
	.query('verifyReferralCode', {
		input: z.object({
			referralCode: z
				.string()
				.min(3, 'Invalid referral code')
				.max(20, 'Invalid referral code'),
		}),
		async resolve({ ctx, input: { referralCode } }) {
			const user = await verifyReferralCode(ctx, referralCode)

			ctx.res?.setHeader(
				'Cache-Control',
				`s-maxage=${ONE_MONTH_IN_SECONDS}, stale-while-revalidate`
			)

			return Boolean(user)
		},
	})
	.mutation('add', {
		input: z.object({
			referralCode: z
				.string()
				.min(3, 'Invalid referral code')
				.max(20, 'Invalid referral code'),
			name: z
				.string()
				.min(3, 'Full name must be at least 3 characters long')
				.max(200, 'Full name cannot exceed 200 characters'),
			email: z.string().email('Invalid email'),
			socialUrls: z
				.string()
				.min(5, 'Social URLs must be at least 5 characters long')
				.max(500, 'Social URLs cannot exceed 500 characters'),
			phone: z
				.string()
				.min(3, 'Phone must be at least 3 characters long')
				.max(50, 'Phone cannot exceed 50 characters'),
			roles: z
				.array(
					z
						.string()
						.min(3, 'Roles must be at least 3 characters long')
						.max(32, 'Roles cannot exceed 32 characters')
				)
				.min(1, 'You must select at least 1 role')
				.max(3, 'You can only select up to 3 roles'),
			resume: z
				.string()
				.url(
					'Unexpected error with CV/Resume - Please try to add the file again'
				),
		}),
		async resolve({ ctx, input }) {
			const [referralCode, referrer] = await Promise.all([
				generateId(REFERRAL_CODE_LENGTH),
				verifyReferralCode(ctx, input.referralCode),
			])

			const referralUrl = `${BASE_URL}?code=${referralCode}`

			try {
				await ctx.prisma.user.create({
					data: {
						referralCode,
						email: input.email,
						referrerId: referrer.id,
					},
				})
			} catch (e) {
				if (e instanceof Prisma.PrismaClientKnownRequestError) {
					if (e.code === 'P2002')
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Email is already in use',
						})
					else
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message:
								'An unexpected error occurred - Please try again later',
						})
				}
				throw e
			}

			try {
				await Promise.all([
					sendSubmissionEmail({
						firstName: input.name.split(' ')[0] as string,
						email: input.email,
					}),
					insertUserToNotion({
						name: input.name,
						email: input.email,
						socialUrls: input.socialUrls,
						phone: input.phone,
						roles: input.roles,
						resume: input.resume,
					}),
				])
			} catch (e) {
				await ctx.prisma.user
					.delete({ where: { email: input.email } })
					.catch(() => {})
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'An unexpected error occurred - Please try again later',
				})
			}

			return true
		},
	})
