import { useState, useEffect, useMemo } from 'react'
import Router, { useRouter } from 'next/router'
import { z, ZodError } from 'zod'

import { trpc, parseErrorMessage } from '../utils/trpc'
import { uploadFile } from '../utils/file'
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
	resume: File
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
	resume: z.object(
		{
			name: z
				.string()
				.min(1, 'CV/Resume is required')
				.refine(
					(name) => name.endsWith('.pdf'),
					'CV/Resume must be a PDF file'
				),
		},
		{ required_error: 'CV/Resume is required' }
	),
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
			return false
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
	const [resumeUrl, setResumeUrl] = useState('')
	const [isSubmissionLoading, setIsSubmissionLoading] = useState(false)

	const {
		isReady: isRouterReady,
		query: { code },
	} = useRouter()

	const { data, isLoading, refetch, error } = trpc.useQuery(
		['user.verifyReferralCode', { referralCode }],
		{ enabled: false, retry: false }
	)

	const mutation = trpc.useMutation(['user.add'], { retry: false })

	const sendForm = useMemo(
		() => async () => {
			try {
				setIsSubmissionLoading(true)

				const payload = {
					referralCode,
					name,
					email,
					socialUrls,
					phone,
					resume,
					roles: Array.from(roles),
				}

				const isFormValid = await validateForm({
					...payload,
					setError: setFormError,
				})
				if (!isFormValid) return

				let newResumeUrl: string
				const resumeUrlExists = Boolean(resumeUrl)

				if (resumeUrlExists) newResumeUrl = resumeUrl
				else {
					newResumeUrl = await uploadFile({
						file: resume as File,
						contentType: 'application/pdf',
					})
					setResumeUrl(newResumeUrl)
				}

				return mutation.mutate({ ...payload, resume: newResumeUrl })
			} finally {
				setIsSubmissionLoading(false)
			}
		},
		[
			mutation,
			referralCode,
			name,
			email,
			socialUrls,
			phone,
			roles,
			resume,
			resumeUrl,
		]
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
			if (isRouterReady) Router.push('/')
			return
		}
		setReferralCode(code)
	}, [isRouterReady, code])

	useEffect(() => {
		if (!referralCode) return
		if (/\W/g.test(referralCode)) {
			setReferralCode(referralCode.replace(/\W/g, ''))
			return
		}
		refetch()
	}, [referralCode, refetch])

	useEffect(
		() => setFormError(''),
		[name, email, socialUrls, phone, roles, resume]
	)

	useEffect(() => {
		setFormError(parseErrorMessage(mutation.error) || '')
	}, [mutation.error])

	useEffect(() => setResumeUrl(''), [resume])

	const Content = useMemo(() => {
		if (mutation.isSuccess)
			return (
				<>
					<div className={styles.successIcon}>
						<TickFillIcon />
					</div>
					<p className={styles.text}>
						Your form was submitted successfully. We will now review
						your application and reach out to you within 24 hours
						with the following steps.
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
				<h1 className={styles.title}>Application form</h1>

				<p className={styles.subtitle}>
					Fill out this form and our team will get back to you within
					24 hours.
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
						disabled={
							Boolean(formError) ||
							mutation.isLoading ||
							isSubmissionLoading
						}
						className={styles.button}
					>
						{(isSubmissionLoading || mutation.isLoading) && (
							<LoadingSpinner />
						)}
						<p>Send form</p>
					</button>

					<ErrorMessage message={formError} />
				</div>
			</>
		)
	}, [
		data,
		isLoading,
		error,
		email,
		name,
		socialUrls,
		phone,
		roles,
		sendForm,
		formError,
		mutation,
		isSubmissionLoading,
		resume,
	])

	return <div className={styles.container}>{Content}</div>
}
