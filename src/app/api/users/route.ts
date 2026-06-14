import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role")

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, email: true, role: true, managerId: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 })
  }

  const { name, email, password, role, managerId } = await req.json()

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
  }

  if (!["ADMIN", "MANAGER", "COMMERCIAL"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
  }

  if (role === "COMMERCIAL" && !managerId) {
    return NextResponse.json({ error: "Un manager est requis pour un commercial" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      managerId: role === "COMMERCIAL" ? parseInt(managerId) : null,
    },
    select: { id: true, name: true, email: true, role: true, managerId: true },
  })

  return NextResponse.json(newUser, { status: 201 })
}
