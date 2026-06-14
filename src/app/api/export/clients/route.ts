import { auth } from "@/auth"
import { PrismaClient, Prisma } from "@prisma/client"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

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

  try {
    const clients = await prisma.client.findMany({
      where: roleFilter,
      include: { commercial: true },
      orderBy: { name: "asc" },
    })

    // Transform data for Excel
    const data = clients.map((c) => ({
      Code: c.code,
      Nom: c.name,
      Ville: c.city,
      Canal: c.channel,
      Catégorie: c.category,
      Statut: c.status,
      Commercial: c.commercial?.name || "",
      Téléphone: c.phone || "",
      Email: c.email || "",
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Clients")

    // Set column widths
    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ]

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Return as file
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return new Response(JSON.stringify({ error: "Export failed" }), {
      status: 500,
    })
  }
}
