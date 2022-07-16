// https://gist.github.com/pstoica/4323d3e6e37e8a23dd59
export function handleBlur(
	e: React.ChangeEvent<HTMLElement>,
	callback: () => void
) {
	const currentTarget = e.currentTarget
	setTimeout(() => {
		if (!currentTarget.contains(document.activeElement)) callback()
	}, 0)
}
