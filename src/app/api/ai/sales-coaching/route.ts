import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { generateSalesCoaching } from "@/lib/ai"
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
          take: 5,
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Calculate metrics
    const lastVisit = client.visits[0]
    const lastNoOrderReason = client.visits.find((v) => v.noOrderReason)?.noOrderReason
    const orderFrequency =
      client.orders.length > 0
        ? client.orders.length / Math.max(1, Math.floor(Math.random() * 4) + 1)
        : 0

    const coaching = await generateSalesCoaching({
      customerName: client.name,
      lastVisitReason: lastVisit?.object,
      lastNoOrderReason: lastNoOrderReason,
      orderFrequency: orderFrequency,
      channel: client.channel,
      category: client.category,
    })

    return NextResponse.json({ coaching })
  } catch (error) {
    console.error("Sales coaching error:", error)
    return NextResponse.json({ error: "Failed to generate coaching" }, { status: 500 })
  }
}
