"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PublicNavbar from "@/components/PublicNavbar"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    if (res?.error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PublicNavbar />

      <div className="flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
          <Link href="/" className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl" title="Retour">
            ←
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
            <p className="text-gray-500 mt-2">Accédez à votre espace SalesTrack</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              S&apos;inscrire
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-xs text-gray-600 mb-3">Comptes de test — clic pour remplir :</p>
            <div className="space-y-2">
              {[
                { label: "Admin", email: "admin@salestrack.com", password: "admin123" },
                { label: "Manager", email: "manager@salestrack.com", password: "manager123" },
                { label: "Commercial", email: "commercial1@salestrack.com", password: "commercial123" },
              ].map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a.email, a.password)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <span className="font-semibold text-gray-700">{a.label}</span>
                  <span className="text-gray-400 ml-2">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
