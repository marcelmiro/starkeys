import Link from 'next/link'

import SkeletonImage from './SkeletonImage'
import styles from '../styles/Navbar.module.scss'

export default function Navbar() {
	return (
		<div className={styles.container}>
			<Link href="/">
				<a target="_self">
					<SkeletonImage
						src="/logo.png"
						className={styles.logo}
						alt="StarKeys logo"
					/>
				</a>
			</Link>

			<p className={styles.name}>StarKeys</p>
		</div>
	)
}
