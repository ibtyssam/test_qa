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

  let visits

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

  return NextResponse.json(visits)
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

  const visit = await prisma.visit.create({
    data: {
      clientId: parseInt(body.clientId),
      commercialId: userId,
      object: body.object,
      comment: body.comment,
      status: body.status,
      noOrderReason: body.noOrderReason || null,
      date: new Date(),
    },
  })

  return NextResponse.json(visit)
}