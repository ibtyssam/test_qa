import { describe, it, expect } from "vitest"
import { calcTransformationRate, buildClientSearchFilter } from "../src/lib/access"
import { getRoleLabel, getRoleDescription } from "../src/lib/roles"

describe("calcTransformationRate", () => {
  it("calcule le taux correctement", () => {
    const visits = [
      { status: "commande" },
      { status: "commande" },
      { status: "non-commande" },
      { status: "commande" },
    ]
    expect(calcTransformationRate(visits)).toEqual({ total: 4, commandes: 3, taux: 75 })
  })

  it("retourne 0% si aucune visite", () => {
    expect(calcTransformationRate([])).toEqual({ total: 0, commandes: 0, taux: 0 })
  })
})

describe("buildClientSearchFilter", () => {
  it("construit un filtre de recherche textuelle", () => {
    const filter = buildClientSearchFilter({ q: "casablanca" })
    expect(filter.OR).toHaveLength(3)
  })

  it("combine plusieurs filtres", () => {
    const filter = buildClientSearchFilter({ status: "actif", city: "Rabat", channel: "ON-trade" })
    expect(filter.status).toBe("actif")
    expect(filter.city).toBe("Rabat")
    expect(filter.channel).toBe("ON-trade")
  })
})

describe("roles", () => {
  it("traduit les rôles en français", () => {
    expect(getRoleLabel("ADMIN")).toBe("Administrateur")
    expect(getRoleLabel("MANAGER")).toBe("Manager")
    expect(getRoleLabel("COMMERCIAL")).toBe("Commercial")
  })

  it("fournit une description par rôle", () => {
    expect(getRoleDescription("COMMERCIAL")).toContain("portefeuille")
  })
})
