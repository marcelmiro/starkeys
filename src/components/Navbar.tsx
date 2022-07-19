import SkeletonImage from './SkeletonImage'
import styles from '../styles/Navbar.module.scss'

export default function Navbar() {
	return (
		<div className={styles.container}>
			<SkeletonImage
				src="/logo.png"
				className={styles.logo}
				alt="StarKeys logo"
			/>

			<p className={styles.name}>StarKeys</p>
		</div>
	)
}
