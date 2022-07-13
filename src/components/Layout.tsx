import Meta from './Meta'

const Layout = ({ children }: { children: React.ReactNode }) => (
	<>
		<Meta />
		{children}
	</>
)

export default Layout
