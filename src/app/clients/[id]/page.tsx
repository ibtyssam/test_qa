import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)
  const clientId = parseInt(id)

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      commercial: true,
      visits: { orderBy: { date: "desc" } },
      orders: { include: { lines: true }, orderBy: { createdAt: "desc" } },
    },
  })

  if (!client) redirect("/clients")

  if (role === "COMMERCIAL" && client.commercialId !== userId) redirect("/clients")

  if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u) => u.id)
    if (!teamIds.includes(client.commercialId)) redirect("/clients")
  }

  const totalVisits = client.visits.length
  const commandes = client.visits.filter((v: any) => v.status === "commande").length
  const taux = totalVisits > 0 ? Math.round((commandes / totalVisits) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={role} />

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/clients" className="text-blue-600 hover:underline text-sm">← Clients</Link>
          <h2 className="text-2xl font-bold text-gray-800">{client.name}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            client.status === "actif" ? "bg-green-100 text-green-700" :
            client.status === "prospect" ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {client.status}
          </span>
          {role === "ADMIN" && (
            <Link
              href={`/clients/${client.id}/edit`}
              className="ml-auto text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 font-medium"
            >
              Modifier
            </Link>
          )}
        </div>

        {/* Fiche client */}
        <div className="bg-white rounded-xl shadow p-5 mb-5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-gray-800">Fiche client</h3>
            <span className="font-mono text-xs text-gray-400">{client.code}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Ville</p>
              <p className="font-medium">{client.city}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Canal</p>
              <p className="font-medium">{client.channel}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Catégorie</p>
              <p className="font-medium">{client.category}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Commercial</p>
              <p className="font-medium">{client.commercial?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total visites</p>
              <p className="font-medium">{totalVisits}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Taux transformation</p>
              <p className="font-medium text-green-600">{taux}%</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Link
            href={`/visits/new?clientId=${client.id}`}
            className="bg-green-600 text-white rounded-xl p-4 text-center font-semibold hover:bg-green-700 transition"
          >
            ➕ Nouvelle visite
          </Link>
          <Link
            href={`/orders/new?clientId=${client.id}`}
            className="bg-orange-500 text-white rounded-xl p-4 text-center font-semibold hover:bg-orange-600 transition"
          >
            📦 Nouvelle commande
          </Link>
        </div>

        {/* Historique visites */}
        <div className="bg-white rounded-xl shadow p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-4">Historique des visites ({totalVisits})</h3>
          {client.visits.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Aucune visite enregistrée</p>
          ) : (
            <div className="space-y-3">
              {client.visits.map((v: any) => (
                <div key={v.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{v.object}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.status === "commande" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  {v.comment && <p className="text-xs text-gray-500 mb-1">{v.comment}</p>}
                  {v.noOrderReason && (
                    <p className="text-xs text-orange-500">Raison : {v.noOrderReason}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(v.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique commandes */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-gray-800 mb-4">Commandes & Devis ({client.orders.length})</h3>
          {client.orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Aucune commande enregistrée</p>
          ) : (
            <div className="space-y-3">
              {client.orders.map((o: any) => (
                <div key={o.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      o.type === "commande" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {o.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      o.status === "validée" ? "bg-green-100 text-green-700" :
                      o.status === "en_attente" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {o.lines.map((l: any) => (
                      <p key={l.id} className="text-xs text-gray-600">
                        {l.designation} × {l.quantity} = {l.total} DH
                      </p>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-800 mt-2">Total : {o.total} DH</p>
                  <p className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}