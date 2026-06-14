import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { generateCustomerInsight } from "@/lib/ai"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { clientId } = await req.json()

    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
      include: {
        visits: {
          orderBy: { date: "desc" },
          take: 3,
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const insight = await generateCustomerInsight({
      customerName: client.name,
      city: client.city,
      channel: client.channel,
      status: client.status,
      recentVisits: client.visits.map((v) => ({
        date: new Date(v.date).toLocaleDateString("fr-FR"),
        status: v.status,
        object: v.object,
        noOrderReason: v.noOrderReason || undefined,
        comment: v.comment || undefined,
      })),
      recentOrders: client.orders.map((o) => ({
        date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
        total: o.total,
        type: o.type,
        status: o.status,
      })),
    })

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("AI insight error:", error)
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 })
  }
}
