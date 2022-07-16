import { useState, useEffect, useMemo } from 'react'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'
import { z, ZodError } from 'zod'

import { trpc, parseErrorMessage } from '../utils/trpc'
import { encodeFile } from '../utils/file'
import SkeletonImage from '../components/SkeletonImage'
import LoadingSpinner from '../components/LoadingSpinner'
import InputGroup from '../components/InputGroup'
import ErrorMessage from '../components/ErrorMessage'
import Multiselect from '../components/Multiselect'
import FileUpload from '../components/FileUpload'
import TickFillIcon from '../../public/tick_filled.svg'
import styles from '../styles/join.module.scss'

const ROLES = [
	'Business strategy',
	'Designer',
	'Developer',
	'Marketing',
	'Public relations',
	'Product manager',
	'Sales',
] as const

interface FormData {
	referralCode: string
	name: string
	email: string
	socialUrls: string
	phone: string
	roles: string[]
	resume: string
}

const zodFormValidation = z.object({
	name: z
		.string()
		.min(3, 'Full name must be at least 3 characters long')
		.max(200, 'Full name cannot exceed 200 characters'),
	email: z.string().min(1, 'Email is required').email('Invalid email'),
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
		.string({ required_error: 'CV/Resume is required' })
		.min(1, 'CV/Resume is required'),
})

async function validateForm({
	setError,
	...data
}: Partial<FormData> & { setError(message: string): void }) {
	try {
		await zodFormValidation.parseAsync(data)
		return true
	} catch (e) {
		if (e instanceof ZodError && e.issues[0]?.message) {
			setError(e.issues[0].message)
		} else throw e
	}
}

export default function Join() {
	const [referralCode, setReferralCode] = useState('')
	const [formError, setFormError] = useState('')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [socialUrls, setSocialUrls] = useState('')
	const [phone, setPhone] = useState('')
	const [roles, setRoles] = useState(new Set<string>())
	const [resume, setResume] = useState<File>()

	const {
		isReady,
		query: { code },
	} = useRouter()

	const { data, isLoading, refetch, error } = trpc.useQuery(
		['user.verifyReferralCode', { referralCode }],
		{ enabled: false, retry: false }
	)

	const mutation = trpc.useMutation(['user.add'], { retry: false })

	const sendForm = useMemo(
		() => async () => {
			const payload = {
				referralCode,
				name,
				email,
				socialUrls,
				phone,
				roles: Array.from(roles),
				resume: resume && (await encodeFile(resume)),
			}

			const isFormValid = await validateForm({
				...payload,
				setError: setFormError,
			})
			if (!isFormValid) return

			return mutation.mutate(payload as FormData)
		},
		[mutation, referralCode, name, email, socialUrls, phone, roles, resume]
	)

	function handleEmailChange(value: string) {
		setEmail(value.replace(/\s/g, ''))
	}

	function handlePhoneChange(value: string) {
		setPhone(value.replace(/[^\+\(\)\d\s]/g, '').replace(/\s{2,}/g, ' '))
	}

	function handleRolesChange(value: Set<string>) {
		if (value.size > 3) return
		setRoles(value)
	}

	function handleResumeChange(value: File) {
		if (!value.name || !value.name.endsWith('.pdf')) return
		setResume(value)
	}

	useEffect(() => {
		if (!code || typeof code !== 'string') {
			if (isReady) Router.push('/')
			return
		}
		setReferralCode(code)
	}, [isReady, code])

	useEffect(() => {
		if (!referralCode) return
		if (/\W/g.test(referralCode)) {
			setReferralCode(referralCode.replace(/\W/g, ''))
			return
		}
		refetch()
	}, [referralCode, refetch])

	useEffect(() => setFormError(''), [name, email, socialUrls, phone, roles])

	useEffect(() => {
		setFormError(parseErrorMessage(mutation.error) || '')
	}, [mutation.error])

	const Content = useMemo(() => {
		if (mutation.isSuccess)
			return (
				<>
					<div className={styles.successIcon}>
						<TickFillIcon />
					</div>
					<p className={styles.text}>
						Your form was submitted successfully. We will now review
						your application and get in contact with you for your
						first interview with us.
					</p>
					<button
						className={styles.shortButton}
						onClick={() => Router.push('/')}
					>
						Go home
					</button>
				</>
			)
		if (error)
			return (
				<>
					<p className={styles.text}>{parseErrorMessage(error)}</p>
					<button
						className={styles.shortButton}
						onClick={() => Router.push('/')}
					>
						Go home
					</button>
				</>
			)
		if (isLoading || !data)
			return <LoadingSpinner className={styles.loader} />
		return (
			<>
				<h1 className={styles.title}>Hello {referralCode}</h1>

				<p className={styles.subtitle}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					Proin dapibus, magna eu lobortis posuere, est nibh lobortis
					quam, vel consequat lorem augue eget ipsum. Donec dolor
					quam, condimentum id nibh non, vestibulum egestas justo. Sed
					ultrices ipsum dolor, non commodo tellus placerat eu. In
					semper dolor sit amet congue elementum.
				</p>

				<div className={styles.form}>
					<InputGroup
						label="Full name"
						id="name"
						value={name}
						onChange={setName}
						maxLength={200}
					/>

					<InputGroup
						label="Email"
						id="email"
						value={email}
						onChange={handleEmailChange}
						maxLength={320}
					/>

					<InputGroup
						label="Social URLs (e.g. LinkedIn & Github)"
						id="socialUrls"
						value={socialUrls}
						onChange={setSocialUrls}
						textarea
						minHeight="5rem"
						maxLength={500}
					/>

					<InputGroup
						label="Phone number (include country code, e.g. +44 75...)"
						id="phone"
						inputType="tel"
						value={phone}
						onChange={handlePhoneChange}
						maxLength={320}
					/>

					<InputGroup label="Roles (max. 3)" id="roles">
						<Multiselect
							id="roles"
							placeholder="Select roles"
							items={ROLES}
							value={roles}
							onChange={handleRolesChange}
							allowCustom
						/>
					</InputGroup>

					<InputGroup label="CV/Resume" id="cv">
						<FileUpload
							id="resume"
							contentType="application/pdf"
							value={resume}
							onChange={handleResumeChange}
						/>
					</InputGroup>

					<button
						onClick={sendForm}
						disabled={Boolean(formError) || mutation.isLoading}
						className={styles.button}
					>
						Send form
					</button>

					<ErrorMessage message={formError} />
				</div>
			</>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		data,
		isLoading,
		error,
		referralCode,
		email,
		name,
		socialUrls,
		phone,
		roles,
		sendForm,
		formError,
		mutation,
	])

	return (
		<div className={styles.container}>
			<Link href="/">
				<a target="_self" className={styles.logo}>
					<SkeletonImage src="/logo.png" alt="Logo" />
				</a>
			</Link>

			{Content}
		</div>
	)
}
