import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { getRoleDescription, getRoleLabel } from "@/lib/roles"
import ChatBot from "@/components/ChatBot"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let visits: any[] = []
  let clients: any[] = []
  let orders: any[] = []
  let teamMembers: any[] = []

  if (role === "ADMIN") {
    visits = await prisma.visit.findMany({ include: { client: true, commercial: true }, orderBy: { date: "desc" } })
    clients = await prisma.client.findMany({ include: { commercial: true } })
    orders = await prisma.order.findMany({ include: { client: true, commercial: true } })
    teamMembers = await prisma.user.findMany({ where: { role: "COMMERCIAL" } })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    teamMembers = team
    const teamIds = team.map((u: any) => u.id)
    visits = await prisma.visit.findMany({ where: { commercialId: { in: teamIds } }, include: { client: true, commercial: true }, orderBy: { date: "desc" } })
    clients = await prisma.client.findMany({ where: { commercialId: { in: teamIds } } })
    orders = await prisma.order.findMany({ where: { commercialId: { in: teamIds } }, include: { client: true, commercial: true } })
  } else {
    visits = await prisma.visit.findMany({ where: { commercialId: userId }, include: { client: true, commercial: true }, orderBy: { date: "desc" } })
    clients = await prisma.client.findMany({ where: { commercialId: userId } })
    orders = await prisma.order.findMany({ where: { commercialId: userId }, include: { client: true } })
  }

  const totalVisits = visits.length
  const commandeVisits = visits.filter((v: any) => v.status === "commande").length
  const tauxTransformation = totalVisits > 0 ? Math.round((commandeVisits / totalVisits) * 100) : 0
  
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const todayVisits = visits.filter((v: any) => {
    const visitDate = new Date(v.date)
    return visitDate >= todayStart && visitDate < todayEnd
  }).length

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={role} />

      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Bonjour, {user.name} 👋
          </h2>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            <span className="font-medium text-blue-700">{getRoleLabel(role)}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">{getRoleDescription(role)}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-xs mb-1">Visites totales</p>
            <p className="text-3xl font-bold text-blue-900">{totalVisits}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-xs mb-1">Visites aujourd'hui</p>
            <p className="text-3xl font-bold text-blue-600">{todayVisits}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-xs mb-1">Taux transformation</p>
            <p className="text-3xl font-bold text-green-600">{tauxTransformation}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-xs mb-1">Clients</p>
            <p className="text-3xl font-bold text-purple-600">{clients.length}</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/clients" className="bg-blue-700 text-white rounded-xl p-5 text-center font-semibold text-lg hover:bg-blue-800 transition flex flex-col items-center gap-2">
            <span className="text-3xl">👥</span>
            {role === "COMMERCIAL" ? "Mes Clients" : "Clients"}
          </Link>
          <Link href="/visits/new" className="bg-green-600 text-white rounded-xl p-5 text-center font-semibold text-lg hover:bg-green-700 transition flex flex-col items-center gap-2">
            <span className="text-3xl">➕</span>
            Nouvelle Visite
          </Link>
          <Link href="/orders" className="bg-orange-500 text-white rounded-xl p-5 text-center font-semibold text-lg hover:bg-orange-600 transition flex flex-col items-center gap-2">
            <span className="text-3xl">📦</span>
            {role === "COMMERCIAL" ? "Mes Commandes" : "Commandes"}
          </Link>
        </div>

        {/* ChatBot */}
        {(role === "ADMIN" || role === "MANAGER") && (
          <div className="mb-6">
            <ChatBot role={role} teamMembers={teamMembers} />
          </div>
        )}

        {/* Section Admin : stats par commercial */}
        {(role === "ADMIN" || role === "MANAGER") && (
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">
              {role === "ADMIN" ? "📊 Activité par commercial" : "👥 Mon équipe"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Commercial</th>
                    <th className="pb-2">Visites</th>
                    <th className="pb-2">Commandes</th>
                    <th className="pb-2">Taux</th>
                    <th className="pb-2">Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member: any) => {
                    const memberVisits = visits.filter((v: any) => v.commercialId === member.id)
                    const memberCommandes = memberVisits.filter((v: any) => v.status === "commande")
                    const memberClients = clients.filter((c: any) => c.commercialId === member.id)
                    const taux = memberVisits.length > 0 ? Math.round((memberCommandes.length / memberVisits.length) * 100) : 0
                    return (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{member.name}</td>
                        <td className="py-2">{memberVisits.length}</td>
                        <td className="py-2">{memberCommandes.length}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${taux >= 50 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {taux}%
                          </span>
                        </td>
                        <td className="py-2">{memberClients.length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin : bouton gestion utilisateurs */}
        {role === "ADMIN" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Link href="/clients/new" className="bg-white border-2 border-blue-700 text-blue-700 rounded-xl p-4 text-center font-semibold hover:bg-blue-50 transition">
              ➕ Nouveau client
            </Link>
            <Link href="/admin/users" className="bg-white border-2 border-purple-600 text-purple-600 rounded-xl p-4 text-center font-semibold hover:bg-purple-50 transition">
              👤 Gérer les utilisateurs
            </Link>
          </div>
        )}

        {/* Visites récentes */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Visites récentes</h3>
            <Link href="/visits" className="text-blue-600 text-sm hover:underline">Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Objet</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Date</th>
                  {role !== "COMMERCIAL" && <th className="pb-2">Commercial</th>}
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 5).map((v: any) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{v.client?.name}</td>
                    <td className="py-2">{v.object}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${v.status === "commande" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2">{new Date(v.date).toLocaleDateString("fr-FR")}</td>
                    {role !== "COMMERCIAL" && <td className="py-2">{v.commercial?.name}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {visits.length === 0 && <p className="text-center text-gray-400 py-6">Aucune visite</p>}
          </div>
        </div>
      </div>
    </div>
  )
}