import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10)
  const managerPassword = await bcrypt.hash("manager123", 10)
  const commercialPassword = await bcrypt.hash("commercial123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@salestrack.com" },
    update: {},
    create: {
      email: "admin@salestrack.com",
      password: adminPassword,
      name: "Admin Principal",
      role: "ADMIN",
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@salestrack.com" },
    update: {},
    create: {
      email: "manager@salestrack.com",
      password: managerPassword,
      name: "Sarah Manager",
      role: "MANAGER",
    },
  })

  const commercial1 = await prisma.user.upsert({
    where: { email: "commercial1@salestrack.com" },
    update: {},
    create: {
      email: "commercial1@salestrack.com",
      password: commercialPassword,
      name: "Karim Commercial",
      role: "COMMERCIAL",
      managerId: manager.id,
    },
  })

  const commercial2 = await prisma.user.upsert({
    where: { email: "commercial2@salestrack.com" },
    update: {},
    create: {
      email: "commercial2@salestrack.com",
      password: commercialPassword,
      name: "Yasmine Commercial",
      role: "COMMERCIAL",
      managerId: manager.id,
    },
  })

  const client1 = await prisma.client.upsert({
    where: { code: "CLT001" },
    update: {},
    create: {
      code: "CLT001",
      name: "Restaurant Al Fassia",
      city: "Casablanca",
      channel: "ON-trade",
      category: "Restaurant",
      status: "actif",
      commercialId: commercial1.id,
    },
  })

  const client2 = await prisma.client.upsert({
    where: { code: "CLT002" },
    update: {},
    create: {
      code: "CLT002",
      name: "Hotel Atlas",
      city: "Rabat",
      channel: "ON-trade",
      category: "Hotel",
      status: "actif",
      commercialId: commercial1.id,
    },
  })

  const client3 = await prisma.client.upsert({
    where: { code: "CLT003" },
    update: {},
    create: {
      code: "CLT003",
      name: "Epicerie Centrale",
      city: "Marrakech",
      channel: "OFF-trade",
      category: "Epicerie",
      status: "actif",
      commercialId: commercial2.id,
    },
  })

  const client4 = await prisma.client.upsert({
    where: { code: "CLT004" },
    update: {},
    create: {
      code: "CLT004",
      name: "Cafe Moulay",
      city: "Fes",
      channel: "ON-trade",
      category: "Cafe",
      status: "prospect",
      commercialId: commercial2.id,
    },
  })

  await prisma.visit.create({
    data: {
      clientId: client1.id,
      commercialId: commercial1.id,
      object: "prise de commande",
      comment: "Client satisfait, renouvellement commande habituelle",
      status: "commande",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  })

  await prisma.visit.create({
    data: {
      clientId: client2.id,
      commercialId: commercial1.id,
      object: "suivi client",
      comment: "Stock encore suffisant",
      status: "non-commande",
      noOrderReason: "stock non ecoulé",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  })

  await prisma.visit.create({
    data: {
      clientId: client3.id,
      commercialId: commercial2.id,
      object: "prise de commande",
      comment: "Nouvelle commande validée",
      status: "commande",
      date: new Date(),
    },
  })

  await prisma.visit.create({
    data: {
      clientId: client4.id,
      commercialId: commercial2.id,
      object: "prospection",
      comment: "Premier contact positif",
      status: "non-commande",
      noOrderReason: "attente validation direction",
      date: new Date(),
    },
  })

  await prisma.order.create({
    data: {
      clientId: client1.id,
      commercialId: commercial1.id,
      type: "commande",
      status: "validée",
      total: 1500,
      lines: {
        create: [
          {
            designation: "Jus d'orange 1L",
            quantity: 50,
            unitPrice: 15,
            total: 750,
          },
          {
            designation: "Eau minérale 1.5L",
            quantity: 100,
            unitPrice: 7.5,
            total: 750,
          },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      clientId: client3.id,
      commercialId: commercial2.id,
      type: "devis",
      status: "en_attente",
      total: 800,
      lines: {
        create: [
          {
            designation: "Lait UHT 1L",
            quantity: 80,
            unitPrice: 10,
            total: 800,
          },
        ],
      },
    },
  })
await prisma.visit.create({
    data: {
      clientId: client1.id,
      commercialId: commercial1.id,
      object: "suivi client",
      comment: "Visite du jour",
      status: "commande",
      date: new Date(),
    },
  })

  await prisma.visit.create({
    data: {
      clientId: client3.id,
      commercialId: commercial2.id,
      object: "prise de commande",
      comment: "Visite du jour 2",
      status: "non-commande",
      noOrderReason: "client absent",
      date: new Date(),
    },
  })
  console.log("Données créées avec succès !")
  console.log("admin@salestrack.com / admin123")
  console.log("manager@salestrack.com / manager123")
  console.log("commercial1@salestrack.com / commercial123")
  console.log("commercial2@salestrack.com / commercial123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())