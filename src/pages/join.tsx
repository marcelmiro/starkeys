import { useState, useEffect, useMemo } from 'react'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'

import { trpc, parseErrorMessage } from '../utils/trpc'
import SkeletonImage from '../components/SkeletonImage'
import LoadingSpinner from '../components/LoadingSpinner'
import InputGroup from '../components/InputGroup'
import ErrorMessage from '../components/ErrorMessage'
import TickIcon from '../../public/tick.svg'
import styles from '../styles/join.module.scss'

export default function Join() {
	const [referralCode, setReferralCode] = useState('')
	const [formError, setFormError] = useState('')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [bio, setBio] = useState('')

	const {
		isReady,
		query: { code },
	} = useRouter()

	const { data, isLoading, refetch, error } = trpc.useQuery(
		['user.verifyReferralCode', { referralCode }],
		{ enabled: false, retry: false }
	)

	const mutation = trpc.useMutation(['user.add'])

	const sendForm = useMemo(
		() => () => {
			mutation.mutate({ referralCode, name, email, bio })
		},
		[mutation, referralCode, name, email, bio]
	)

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

	useEffect(() => setFormError(''), [name, email, bio])

	useEffect(() => {
		setFormError(parseErrorMessage(mutation.error) || '')
	}, [mutation.error])

	const Content = useMemo(() => {
		if (mutation.isSuccess)
			return (
				<>
					<div className={styles.successIcon}>
						<TickIcon />
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
					<p className={styles.text}>{error.message}</p>
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
						onChange={setEmail}
						maxLength={320}
					/>

					<InputGroup
						label="Bio"
						id="bio"
						value={bio}
						onChange={setBio}
						textarea
						minHeight="10rem"
						maxLength={2000}
					/>

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
	}, [
		data,
		isLoading,
		error,
		bio,
		code,
		email,
		name,
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
