import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import Navbar from "@/components/Navbar"

const prisma = new PrismaClient()

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = session.user as any
  if (user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    include: { manager: true },
    orderBy: { role: "asc" },
  })

  const roleColors: any = {
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    COMMERCIAL: "bg-green-100 text-green-700",
  }

  const roleLabel: any = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    COMMERCIAL: "Commercial",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userName={user.name} role={user.role} />

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
          <h2 className="text-2xl font-bold text-gray-800">Utilisateurs</h2>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            {users.length}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Manager</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.manager?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-blue-800 mb-2">Comptes de test</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p>👑 Admin : admin@salestrack.com / admin123</p>
            <p>📊 Manager : manager@salestrack.com / manager123</p>
            <p>💼 Commercial 1 : commercial1@salestrack.com / commercial123</p>
            <p>💼 Commercial 2 : commercial2@salestrack.com / commercial123</p>
          </div>
        </div>
      </div>
    </div>
  )
}