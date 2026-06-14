import { PrismaClient } from "@prisma/client"

export type SessionUser = {
  id: string
  role: string
  managerId?: string | null
}

export function parseUserId(user: SessionUser): number {
  return parseInt(user.id)
}

export async function getTeamCommercialIds(
  prisma: PrismaClient,
  managerId: number
): Promise<number[]> {
  const team = await prisma.user.findMany({ where: { managerId } })
  return team.map((u) => u.id)
}

export async function canAccessCommercial(
  prisma: PrismaClient,
  user: SessionUser,
  commercialId: number
): Promise<boolean> {
  if (user.role === "ADMIN") return true
  if (user.role === "COMMERCIAL") return parseUserId(user) === commercialId
  if (user.role === "MANAGER") {
    const ids = await getTeamCommercialIds(prisma, parseUserId(user))
    return ids.includes(commercialId)
  }
  return false
}

export function calcTransformationRate(
  visits: { status: string }[]
): { total: number; commandes: number; taux: number } {
  const total = visits.length
  const commandes = visits.filter((v) => v.status === "commande").length
  const taux = total > 0 ? Math.round((commandes / total) * 100) : 0
  return { total, commandes, taux }
}

export function buildClientSearchFilter(params: {
  q?: string
  status?: string
  city?: string
  channel?: string
}) {
  const filter: Record<string, unknown> = {}
  if (params.q) {
    filter.OR = [
      { name: { contains: params.q } },
      { code: { contains: params.q } },
      { city: { contains: params.q } },
    ]
  }
  if (params.status) filter.status = params.status
  if (params.city) filter.city = params.city
  if (params.channel) filter.channel = params.channel
  return filter
}
