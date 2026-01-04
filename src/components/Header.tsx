import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="p-4 flex items-center bg-black text-white shadow-lg">
      <h1 className="text-xl font-semibold">
        <Link to="/" className="hover:text-cyan-400 transition-colors">
          ojoxux.com
        </Link>
      </h1>
    </header>
  )
}
