import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)

  let clients

  if (role === "ADMIN") {
    clients = await prisma.client.findMany({ include: { commercial: true } })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    const teamIds = team.map((u: any) => u.id)
    clients = await prisma.client.findMany({
      where: { commercialId: { in: teamIds } },
      include: { commercial: true },
    })
  } else {
    clients = await prisma.client.findMany({
      where: { commercialId: userId },
      include: { commercial: true },
    })
  }

  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const client = await prisma.client.create({ data: body })
  return NextResponse.json(client)
}