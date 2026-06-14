import Link from "next/link"

export default function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-900">
          SalesTrack
        </Link>
        <div className="flex items-center gap-4">
          <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
            Fonctionnalités
          </Link>
          <Link href="#roles" className="text-sm text-gray-600 hover:text-gray-900">
            Rôles
          </Link>
          <Link href="#demo" className="text-sm text-gray-600 hover:text-gray-900">
            Démo
          </Link>
          <Link href="/login" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
            Se connecter
          </Link>
        </div>
      </div>
    </nav>
  )
}