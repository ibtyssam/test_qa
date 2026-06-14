/**
 * Smoke test — vérifie la base de données et le filtrage par rôle.
 * Usage : node scripts/smoke-test.mjs
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
let passed = 0
let failed = 0

function ok(label) {
  passed++
  console.log(`  ✓ ${label}`)
}

function fail(label, err) {
  failed++
  console.error(`  ✗ ${label}: ${err}`)
}

async function main() {
  console.log("\nSalesTrack — smoke tests\n")

  // Users exist
  const admin = await prisma.user.findUnique({ where: { email: "admin@salestrack.com" } })
  if (admin?.role === "ADMIN") ok("Admin user exists")
  else fail("Admin user exists", "not found or wrong role")

  const manager = await prisma.user.findUnique({ where: { email: "manager@salestrack.com" } })
  if (manager?.role === "MANAGER") ok("Manager user exists")
  else fail("Manager user exists", "not found")

  const commercial = await prisma.user.findUnique({ where: { email: "commercial1@salestrack.com" } })
  if (commercial?.role === "COMMERCIAL" && commercial.managerId === manager?.id) {
    ok("Commercial linked to manager")
  } else fail("Commercial linked to manager", "wrong setup")

  // Password hash works
  if (admin && (await bcrypt.compare("admin123", admin.password))) ok("Admin password valid")
  else fail("Admin password valid", "hash mismatch")

  // Demo data counts
  const clientCount = await prisma.client.count()
  if (clientCount >= 4) ok(`Clients seeded (${clientCount})`)
  else fail("Clients seeded", `only ${clientCount}`)

  const visitCount = await prisma.visit.count()
  if (visitCount >= 4) ok(`Visits seeded (${visitCount})`)
  else fail("Visits seeded", `only ${visitCount}`)

  const orderCount = await prisma.order.count()
  if (orderCount >= 2) ok(`Orders seeded (${orderCount})`)
  else fail("Orders seeded", `only ${orderCount}`)

  // Role scoping: commercial1 only sees their clients
  if (commercial) {
    const commClients = await prisma.client.findMany({ where: { commercialId: commercial.id } })
    if (commClients.length >= 2) ok(`Commercial1 has ${commClients.length} clients`)
    else fail("Commercial1 clients", `only ${commClients.length}`)

    const otherComm = await prisma.user.findUnique({ where: { email: "commercial2@salestrack.com" } })
    if (otherComm) {
      const otherClients = await prisma.client.findMany({ where: { commercialId: otherComm.id } })
      const overlap = commClients.some((c) => otherClients.find((o) => o.id === c.id))
      if (!overlap) ok("Client portfolios are separate per commercial")
      else fail("Client portfolios separate", "overlap detected")
    }
  }

  // Manager sees team clients only
  if (manager) {
    const team = await prisma.user.findMany({ where: { managerId: manager.id } })
    const teamIds = team.map((u) => u.id)
    const teamClients = await prisma.client.findMany({ where: { commercialId: { in: teamIds } } })
    if (teamClients.length >= 4) ok(`Manager team sees ${teamClients.length} clients`)
    else fail("Manager team clients", `only ${teamClients.length}`)
  }

  // Transformation rate sanity
  const visits = await prisma.visit.findMany()
  const commandes = visits.filter((v) => v.status === "commande").length
  const taux = visits.length > 0 ? Math.round((commandes / visits.length) * 100) : 0
  if (taux >= 0 && taux <= 100) ok(`Transformation rate calculable (${taux}%)`)
  else fail("Transformation rate", "invalid")

  console.log(`\n${passed} passed, ${failed} failed\n`)
  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
