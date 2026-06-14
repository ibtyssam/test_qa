"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavbarProps {
  userName: string
  role: string
}

export default function Navbar({ userName, role }: NavbarProps) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "🏠 Dashboard", roles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    { href: "/clients", label: "👥 Clients", roles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    { href: "/visits", label: "📋 Visites", roles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    { href: "/orders", label: "📦 Commandes", roles: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    { href: "/admin/users", label: "👤 Utilisateurs", roles: ["ADMIN"] },
  ]

  const visibleLinks = links.filter((l) => l.roles.includes(role))

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              SalesTrack
            </Link>
            <div className="hidden sm:flex gap-1">
              {visibleLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === l.href
                      ? "bg-blue-700 text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-blue-300">
                {role === "ADMIN" ? "Administrateur" : role === "MANAGER" ? "Manager" : "Commercial"}
              </p>
            </div>
            <Link
              href="/signout"
              className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-lg text-sm transition"
            >
              Déconnexion
            </Link>
          </div>
        </div>
        <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                pathname === l.href
                  ? "bg-blue-700 text-white"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}