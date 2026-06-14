import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let orders: any[] = []

  if (role === "ADMIN") {
    orders = await prisma.order.findMany({
      include: { client: true, commercial: true, lines: true },
      orderBy: { createdAt: "desc" },
    })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u: any) => u.id)
    if (teamIds.length > 0) {
      orders = await prisma.order.findMany({
        where: { commercialId: { in: teamIds } },
        include: { client: true, commercial: true, lines: true },
        orderBy: { createdAt: "desc" },
      })
    }
  } else {
    orders = await prisma.order.findMany({
      where: { commercialId: userId },
      include: { client: true, commercial: true, lines: true },
      orderBy: { createdAt: "desc" },
    })
  }

  const totalCA = orders.reduce((sum: number, o: any) => sum + o.total, 0)
  const validees = orders.filter((o: any) => o.status === "validée").length

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={role} />
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              Dashboard
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Commandes et Devis</h2>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              {orders.length}
            </span>
          </div>
          <div className="flex gap-2">
            <a href="/api/export/orders" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" download>
              📥 Excel
            </a>
            <Link href="/orders/new" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium">
              + Nouvelle commande
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">Total</p>
            <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">Validees</p>
            <p className="text-2xl font-bold text-green-600">{validees}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-xs">CA total</p>
            <p className="text-2xl font-bold text-orange-500">{totalCA.toFixed(0)} DH</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                {role !== "COMMERCIAL" && <th className="px-4 py-3">Commercial</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{o.client?.name}</td>
                  <td className="px-4 py-3">
                    <span className={o.type === "commande" ? "px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700" : "px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"}>
                      {o.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={o.status === "validee" ? "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700" : o.status === "en_attente" ? "px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700" : "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{o.total} DH</td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  {role !== "COMMERCIAL" && <td className="px-4 py-3">{o.commercial?.name}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucune commande trouvee</p>
          )}
        </div>
      </div>
    </div>
  )
}