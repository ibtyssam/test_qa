import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { canAccessCommercial } from "@/lib/access"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let orders

  if (role === "ADMIN") {
    orders = await prisma.order.findMany({
      include: { client: true, commercial: true, lines: true },
      orderBy: { createdAt: "desc" },
    })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u: any) => u.id)
    orders = await prisma.order.findMany({
      where: { commercialId: { in: teamIds } },
      include: { client: true, commercial: true, lines: true },
      orderBy: { createdAt: "desc" },
    })
  } else {
    orders = await prisma.order.findMany({
      where: { commercialId: userId },
      include: { client: true, commercial: true, lines: true },
      orderBy: { createdAt: "desc" },
    })
  }

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  const userId = parseInt(user.id)
  const body = await req.json()

  const client = await prisma.client.findUnique({ where: { id: parseInt(body.clientId) } })
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 })
  if (!(await canAccessCommercial(prisma, user, client.commercialId))) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const order = await prisma.order.create({
    data: {
      clientId: parseInt(body.clientId),
      commercialId: userId,
      type: body.type,
      status: body.status,
      total: body.total,
      lines: {
        create: body.lines.map((l: any) => ({
          designation: l.designation,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          total: l.total,
        })),
      },
    },
  })

  return NextResponse.json(order)
}