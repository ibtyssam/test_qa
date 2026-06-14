import { auth } from "@/auth"
import { redirect } from "next/navigation"
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

  let visits: any[] = []

  try {
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

    // Transform data for Excel
    const data = visits.map((v) => ({
      Date: new Date(v.date).toLocaleDateString("fr-FR"),
      Client: v.client?.name || "",
      Code: v.client?.code || "",
      Commercial: v.commercial?.name || "",
      Status: v.status,
      Objet: v.object,
      "Raison si non-commande": v.noOrderReason || "",
      Commentaire: v.comment || "",
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Visites")

    // Set column widths
    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
    ]

    // Generate buffer
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    // Return as file
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="visites-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return new Response(JSON.stringify({ error: "Export failed" }), {
      status: 500,
    })
  }
}
