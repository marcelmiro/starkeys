import Meta from './Meta'
import Navbar from './Navbar'

const Layout = ({ children }: { children: React.ReactNode }) => (
	<div className="wrapper">
		<Meta />
		<Navbar />
		{children}
	</div>
)

export default Layout
