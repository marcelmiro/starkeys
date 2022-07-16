import { useState, useEffect, useMemo } from 'react'
import classNames from 'classnames'

import { handleBlur } from '../utils/element'
import ArrowHead from '../../public/arrowhead.svg'
import TickIcon from '../../public/tick.svg'
import styles from '../styles/InputGroup.module.scss'

interface MultiselectProps {
	id: string
	placeholder: string
	items: string[] | ReadonlyArray<string>
	value: Set<string>
	onChange(value: MultiselectProps['value']): void
	allowCustom?: boolean
}

export default function Multiselect({
	id,
	placeholder,
	items,
	value,
	onChange,
	allowCustom,
}: MultiselectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [customItem, setCustomItem] = useState('')

	const toggleIsOpen = () => setIsOpen((isOpen) => !isOpen)

	function toggleItem(item: string) {
		const newValue = new Set(value)
		newValue.has(item) ? newValue.delete(item) : newValue.add(item)
		onChange(newValue)
	}

	function handleCustomItemChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '')
		if (value && value.length > 32) return
		setCustomItem(value)
	}

	function submitCustomItem() {
		const customValue = customItem.trim()
		if (!customValue || customValue.length < 3 || value.has(customValue))
			return
        const newValue = new Set(value)
        newValue.add(customValue)
		onChange(newValue)
		setCustomItem('')
	}

	function handleCustomItemKeyPress(
		e: React.KeyboardEvent<HTMLInputElement>
	) {
		if (e.key === 'Enter') submitCustomItem()
	}

	const allItems = useMemo(
		() => Array.from(new Set([...items, ...Array.from(value)])),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, value, value.size]
	)

	return (
		<div
			className={classNames(styles.dropdownContainer, {
				[styles.open || '']: isOpen,
			})}
			onBlur={(e) => handleBlur(e, () => setIsOpen(false))}
		>
			<button onClick={toggleIsOpen} className={styles.dropdownButton}>
				<p>{placeholder}</p>
				<ArrowHead />
			</button>

			<div className={styles.dropdownContent} tabIndex={0}>
				{allItems.map((item, i) => {
					const isChecked = value.has(item)
					return (
						<label className={styles.checkboxContainer} key={i}>
							<input
								type="checkbox"
								value={item}
								name={id}
								checked={isChecked}
								onChange={() => toggleItem(item)}
							/>
							<div className={styles.checkbox}>
								<TickIcon />
							</div>
							<p>{item}</p>
						</label>
					)
				})}

				{allowCustom && (
					<>
						<label className={styles.customItemContainer}>
							<input
								type="text"
								value={customItem}
								onChange={handleCustomItemChange}
								onKeyDown={handleCustomItemKeyPress}
								className={styles.input}
								placeholder="Role not in list? Add it here (min. 3 characters)"
							/>
							<button
								onClick={submitCustomItem}
								className={styles.customItemButton}
							>
								<ArrowHead />
							</button>
						</label>
					</>
				)}
			</div>
		</div>
	)
}
