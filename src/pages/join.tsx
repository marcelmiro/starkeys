import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import SkeletonImage from '../components/SkeletonImage'
import LoadingSpinner from '../components/LoadingSpinner'
import InputGroup from '../components/InputGroup'
import styles from '../styles/join.module.scss'

export default function Join() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [bio, setBio] = useState('')

	const {
		query: { code },
	} = useRouter()

	useEffect(() => {
		if (!code || typeof code !== 'string') return
	}, [code])

	return (
		<div className={styles.container}>
			<Link href="/">
				<a target="_self" className={styles.logo}>
					<SkeletonImage src="/logo.png" alt="Logo" />
				</a>
			</Link>

			<h1 className={styles.title}>Hello {code}</h1>

			<p className={styles.subtitle}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
				dapibus, magna eu lobortis posuere, est nibh lobortis quam, vel
				consequat lorem augue eget ipsum. Donec dolor quam, condimentum
				id nibh non, vestibulum egestas justo. Sed ultrices ipsum dolor,
				non commodo tellus placerat eu. In semper dolor sit amet congue
				elementum.
			</p>

			<div className={styles.form}>
				<InputGroup
					label="Full name"
					id="name"
					value={name}
					onChange={setName}
				/>

				<InputGroup
					label="Email"
					id="email"
					value={email}
					onChange={setEmail}
				/>

				<InputGroup
					label="Bio"
					id="bio"
					value={bio}
					onChange={setBio}
					textarea
					minHeight="10rem"
				/>

				<button className={styles.button}>Send form</button>
			</div>
		</div>
	)
}
