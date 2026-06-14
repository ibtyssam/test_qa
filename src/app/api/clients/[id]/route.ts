import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { canAccessCommercial } from "@/lib/access"

const prisma = new PrismaClient()

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: { commercial: true },
  })

  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const user = session.user as any
  if (!(await canAccessCommercial(prisma, user, client.commercialId))) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  return NextResponse.json(client)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const { id } = await params
  const clientId = parseInt(id)
  const existing = await prisma.client.findUnique({ where: { id: clientId } })
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const { code, name, city, channel, category, status, commercialId } = body

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(city !== undefined && { city }),
      ...(channel !== undefined && { channel }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(commercialId !== undefined && { commercialId: parseInt(commercialId) }),
    },
    include: { commercial: true },
  })

  return NextResponse.json(client)
}
