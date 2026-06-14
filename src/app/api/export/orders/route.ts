import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
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

  let orders: any[] = []

  try {
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

    // Transform data for Excel
    const data = orders.map((o) => ({
      "Référence": o.reference,
      "Date": new Date(o.createdAt).toLocaleDateString("fr-FR"),
      "Client": o.client?.name || "",
      "Code client": o.client?.code || "",
      "Commercial": o.commercial?.name || "",
      "Statut": o.status,
      "Nombre lignes": o.lines?.length || 0,
      "Montant HT": o.total || 0,
      "Type": o.type,
      "Commentaire": o.comment || "",
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Commandes")

    // Set column widths
    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 25 },
    ]

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Return as file
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="commandes-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return new Response(JSON.stringify({ error: "Export failed" }), {
      status: 500,
    })
  }
}
