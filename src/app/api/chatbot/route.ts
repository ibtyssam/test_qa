import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const user = session.user as any
  const role = user.role
  const userId = parseInt(user.id)
  const { question } = await req.json()
  const q = question.toLowerCase()

  let visits: any[] = []
  let clients: any[] = []
  let orders: any[] = []
  let teamMembers: any[] = []

  if (role === "ADMIN") {
    visits = await prisma.visit.findMany({ include: { commercial: true, client: true } })
    clients = await prisma.client.findMany({ include: { commercial: true } })
    orders = await prisma.order.findMany({ include: { commercial: true } })
    teamMembers = await prisma.user.findMany({ where: { role: "COMMERCIAL" } })
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId } })
    teamMembers = team
    const teamIds = team.map((u: any) => u.id)
    visits = await prisma.visit.findMany({ where: { commercialId: { in: teamIds } }, include: { commercial: true, client: true } })
    clients = await prisma.client.findMany({ where: { commercialId: { in: teamIds } } })
    orders = await prisma.order.findMany({ where: { commercialId: { in: teamIds } }, include: { commercial: true } })
  }

  const totalVisits = visits.length
  const commandes = visits.filter((v) => v.status === "commande").length
  const taux = totalVisits > 0 ? Math.round((commandes / totalVisits) * 100) : 0
  const totalCA = orders.reduce((sum, o) => sum + o.total, 0)

  const statsByCommercial = teamMembers.map((m) => {
    const mv = visits.filter((v) => v.commercialId === m.id)
    const mc = mv.filter((v) => v.status === "commande")
    const mo = orders.filter((o) => o.commercialId === m.id)
    const ca = mo.reduce((sum, o) => sum + o.total, 0)
    return {
      name: m.name,
      visits: mv.length,
      commandes: mc.length,
      ca,
      taux: mv.length > 0 ? Math.round((mc.length / mv.length) * 100) : 0,
    }
  })

  const best = [...statsByCommercial].sort((a, b) => b.visits - a.visits)[0]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayVisits = visits.filter((v) => {
    const d = new Date(v.date)
    return d >= today && d < tomorrow
  }).length

  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  const weekVisits = visits.filter((v) => new Date(v.date) >= thisWeek).length

  let answer = ""

  if (q.includes("meilleur") || q.includes("top") || q.includes("performeur")) {
    answer = best
      ? `Le meilleur commercial est ${best.name} avec ${best.visits} visites et un taux de ${best.taux}%.`
      : "Aucun commercial trouvé."
  } else if (q.includes("ca") || q.includes("chiffre")) {
    answer = `Le CA total est de ${totalCA.toFixed(2)} DH pour ${orders.length} commande(s).`
  } else if (q.includes("combien de client") || q.includes("nombre de client")) {
    answer = `Il y a ${clients.length} client(s) dans le système.`
  } else if (q.includes("semaine")) {
    answer = `Cette semaine : ${weekVisits} visite(s) sur les 7 derniers jours.`
  } else if (q.includes("aujourd")) {
    answer = `Aujourd'hui : ${todayVisits} visite(s) enregistrée(s).`
  } else if (q.includes("taux") || q.includes("conversion") || q.includes("transformation")) {
    answer = `Taux de transformation : ${taux}% (${commandes} commandes sur ${totalVisits} visites).`
  } else if (q.includes("visite")) {
    answer = `${totalVisits} visite(s) au total. ${commandes} ont abouti à une commande.`
  } else if (q.includes("commercial") || q.includes("equipe")) {
    answer = statsByCommercial.length === 0
      ? "Aucun commercial trouvé."
      : statsByCommercial.map((s) => `${s.name} : ${s.visits} visites, ${s.taux}% taux, ${s.ca} DH CA`).join("\n")
  } else if (q.includes("commande")) {
    answer = `${orders.length} commande(s). CA total : ${totalCA.toFixed(2)} DH.`
  } else if (q.includes("client")) {
    answer = `Il y a ${clients.length} client(s).`
  } else {
    answer = `Je peux répondre sur :\n- Visites : ${totalVisits} au total, ${todayVisits} aujourd'hui\n- Clients : ${clients.length}\n- CA : ${totalCA.toFixed(2)} DH\n- Taux : ${taux}%\n- Performances commerciaux`
  }

  return NextResponse.json({ answer })
}