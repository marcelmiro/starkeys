import { useRef } from 'react'
import classNames from 'classnames'

import UploadIcon from '../../public/upload.svg'
import PdfIcon from '../../public/pdf.svg'
import styles from '../styles/InputGroup.module.scss'

interface FileUploadProps {
	id: string
	contentType: string
	value?: File
	onChange(file: File): void
}

export default function FileUpload({
	id,
	contentType,
	value,
	onChange,
}: FileUploadProps) {
	const ref = useRef<HTMLInputElement>(null)

	const openFileUpload = () => ref?.current?.click()

	function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file?.name) return
		onChange(file)
	}

	return (
		<div
			className={classNames(styles.inputFileContainer, {
				[styles.active || '']: Boolean(value),
			})}
		>
			<input
				type="file"
				accept={contentType}
				id={id}
				onChange={handleFileUpload}
				ref={ref}
			/>

			<div onClick={openFileUpload} className={styles.inputFileContent}>
				{value?.name ? (
					<>
						<PdfIcon />
						<p>{value.name}</p>
					</>
				) : (
					<>
						<UploadIcon />
						<p>PDF only. Max 1MB.</p>
					</>
				)}
			</div>
		</div>
	)
}
