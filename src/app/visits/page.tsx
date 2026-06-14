import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

export default async function VisitsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let visits: any[] = []

  if (role === "ADMIN") {
    visits = await prisma.visit.findMany({
      include: { client: true, commercial: true },
      orderBy: { date: "desc" },
    })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u: any) => u.id)
    visits = await prisma.visit.findMany({
      where: { commercialId: { in: teamIds } },
      include: { client: true, commercial: true },
      orderBy: { date: "desc" },
    })
  } else {
    visits = await prisma.visit.findMany({
      where: { commercialId: userId },
      include: { client: true, commercial: true },
      orderBy: { date: "desc" },
    })
  }

  const commandes = visits.filter((v: any) => v.status === "commande").length
  const taux = visits.length > 0 ? Math.round((commandes / visits.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={role} />

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
            <h2 className="text-2xl font-bold text-gray-800">Visites</h2>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{visits.length}</span>
          </div>
          <div className="flex gap-2">
            <a href="/api/export/visits" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" download>
              📥 Excel
            </a>
            <Link href="/visits/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
              + Nouvelle visite
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">Total</p>
            <p className="text-2xl font-bold text-blue-900">{visits.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">Commandes</p>
            <p className="text-2xl font-bold text-green-600">{commandes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">Taux</p>
            <p className="text-2xl font-bold text-orange-500">{taux}%</p>
          </div>
        </div>

        {/* Mobile : cartes */}
        <div className="sm:hidden space-y-3">
          {visits.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-gray-800">{v.client?.name}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  v.status === "commande" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {v.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{v.object}</p>
              {v.noOrderReason && <p className="text-xs text-orange-500 mt-1">Raison : {v.noOrderReason}</p>}
              {v.comment && <p className="text-xs text-gray-400 mt-1">{v.comment}</p>}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">{new Date(v.date).toLocaleDateString("fr-FR")}</p>
                {role !== "COMMERCIAL" && <p className="text-xs text-gray-500">{v.commercial?.name}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop : tableau */}
        <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Raison</th>
                <th className="px-4 py-3">Date</th>
                {role !== "COMMERCIAL" && <th className="px-4 py-3">Commercial</th>}
              </tr>
            </thead>
            <tbody>
              {visits.map((v: any) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.client?.name}</td>
                  <td className="px-4 py-3">{v.object}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.status === "commande" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.noOrderReason || "—"}</td>
                  <td className="px-4 py-3">{new Date(v.date).toLocaleDateString("fr-FR")}</td>
                  {role !== "COMMERCIAL" && <td className="px-4 py-3">{v.commercial?.name}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {visits.length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucune visite trouvée</p>
          )}
        </div>
      </div>
    </div>
  )
}