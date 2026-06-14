import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { generateManagerInsight } from "@/lib/ai"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = session.user as any
    const role = user.role
    const userId = parseInt(user.id)

    if (role !== "MANAGER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Only managers and admins can access" }, { status: 403 })
    }

    // Get team members
    let teamIds: number[] = []

    if (role === "MANAGER") {
      const team = await prisma.user.findMany({ where: { managerId: userId } })
      teamIds = team.map((u) => u.id)
    } else {
      // Admin: get all commercials
      const allCommericals = await prisma.user.findMany({ where: { role: "COMMERCIAL" } })
      teamIds = allCommericals.map((u) => u.id)
    }

    if (teamIds.length === 0) {
      return NextResponse.json({ insight: "No team members to analyze" })
    }

    // Get last 30 days data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Fetch team performance data
    const commercialStats = await Promise.all(
      teamIds.map(async (commercialId) => {
        const user = await prisma.user.findUnique({ where: { id: commercialId } })

        const visits = await prisma.visit.findMany({
          where: {
            commercialId,
            date: { gte: thirtyDaysAgo },
          },
        })

        const orders = await prisma.order.findMany({
          where: {
            commercialId,
            createdAt: { gte: thirtyDaysAgo },
          },
        })

        const commandes = visits.filter((v) => v.status === "commande").length
        const conversionRate = visits.length > 0 ? Math.round((commandes / visits.length) * 100) : 0
        const totalCA = orders.reduce((sum, o) => sum + o.total, 0)

        return {
          name: user?.name || "Unknown",
          visitCount: visits.length,
          orderCount: orders.length,
          conversionRate,
          totalCA,
        }
      })
    )

    const insight = await generateManagerInsight({
      teamName: role === "MANAGER" ? "Your Team" : "All Commercials",
      commercials: commercialStats,
      periodDays: 30,
    })

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("Manager insight error:", error)
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 })
  }
}
