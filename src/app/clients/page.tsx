import { Suspense } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient, Prisma } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import ClientFilters from "@/components/ClientFilters"

const prisma = new PrismaClient()

interface ClientsPageProps {
  searchParams: Promise<{ q?: string; status?: string; city?: string; channel?: string }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await auth()
  if (!session) redirect("/login")

  const params = await searchParams
  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let roleFilter: Prisma.ClientWhereInput = {}

  if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u) => u.id)
    roleFilter = { commercialId: { in: teamIds } }
  } else if (role === "COMMERCIAL") {
    roleFilter = { commercialId: userId }
  }

  const searchFilter: Prisma.ClientWhereInput = {}
  if (params.q) {
    searchFilter.OR = [
      { name: { contains: params.q } },
      { code: { contains: params.q } },
      { city: { contains: params.q } },
    ]
  }
  if (params.status) searchFilter.status = params.status
  if (params.city) searchFilter.city = params.city
  if (params.channel) searchFilter.channel = params.channel

  const clients = await prisma.client.findMany({
    where: { AND: [roleFilter, searchFilter] },
    include: { commercial: true },
    orderBy: { name: "asc" },
  })

  const allClients = await prisma.client.findMany({
    where: roleFilter,
    select: { city: true, channel: true },
  })
  const cities = [...new Set(allClients.map((c) => c.city))].sort()
  const channels = [...new Set(allClients.map((c) => c.channel))].sort()

  const title = role === "COMMERCIAL" ? "Mes clients" : "Clients"

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={role} />

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{clients.length}</span>
          </div>
          <div className="flex gap-2">
            <a href="/api/export/clients" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" download>
              📥 Excel
            </a>
            {role === "ADMIN" && (
              <Link href="/clients/new" className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium">
                + Nouveau client
              </Link>
            )}
          </div>
        </div>

        <Suspense fallback={<div className="bg-white rounded-xl shadow p-4 mb-6 h-24 animate-pulse" />}>
          <ClientFilters cities={cities} channels={channels} />
        </Suspense>

        {/* Mobile : cartes */}
        <div className="sm:hidden space-y-3">
          {clients.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{c.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.status === "actif" ? "bg-green-100 text-green-700" :
                  c.status === "prospect" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{c.city} · {c.channel} · {c.category}</p>
              {role !== "COMMERCIAL" && <p className="text-xs text-gray-400 mt-1">Commercial : {c.commercial?.name}</p>}
              <div className="mt-3 flex gap-2">
                <Link href={`/clients/${c.id}`} className="flex-1 text-center bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100">
                  Voir fiche
                </Link>
                <Link href={`/visits/new?clientId=${c.id}`} className="flex-1 text-center bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100">
                  Nouvelle visite
                </Link>
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucun client trouvé</p>
          )}
        </div>

        {/* Desktop : tableau */}
        <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Statut</th>
                {role !== "COMMERCIAL" && <th className="px-4 py-3">Commercial</th>}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3">{c.channel}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "actif" ? "bg-green-100 text-green-700" :
                      c.status === "prospect" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  {role !== "COMMERCIAL" && <td className="px-4 py-3">{c.commercial?.name}</td>}
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/clients/${c.id}`} className="text-blue-600 hover:underline text-xs">
                      Voir
                    </Link>
                    <Link href={`/visits/new?clientId=${c.id}`} className="text-green-600 hover:underline text-xs">
                      Visite
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucun client trouvé</p>
          )}
        </div>
      </div>
    </div>
  )
}
