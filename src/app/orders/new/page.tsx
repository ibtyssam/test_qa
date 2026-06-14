"use client"
import { Suspense, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

function NewOrderPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientId: searchParams.get("clientId") || "",
    type: "commande",
    status: "en_attente",
  })
  const [lines, setLines] = useState([{ designation: "", quantity: 1, unitPrice: 0, total: 0 }])

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients)
  }, [])

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    if (field === "quantity" || field === "unitPrice") {
      newLines[index].total = newLines[index].quantity * newLines[index].unitPrice
    }
    setLines(newLines)
  }

  const addLine = () => {
    setLines([...lines, { designation: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeLine = (index: number) => {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== index))
  }

  const total = lines.reduce((sum, l) => sum + l.total, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lines, total }),
    })
    if (res.ok) {
      router.push("/orders")
    } else {
      alert("Erreur lors de la création")
      setLoading(false)
    }
  }

  const user = session?.user as any

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar userName={user.name} role={user.role} />}

      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="text-blue-600 hover:underline text-sm">← Commandes</Link>
          <h2 className="text-2xl font-bold text-gray-800">Nouvelle commande / devis</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="commande">Commande</option>
                  <option value="devis">Devis</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en_attente">En attente</option>
                  <option value="validée">Validée</option>
                  <option value="refusée">Refusée</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-800 mb-4">Lignes produits</h3>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Désignation"
                    value={line.designation}
                    onChange={(e) => updateLine(index, "designation", e.target.value)}
                    className="col-span-5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", parseInt(e.target.value) || 0)}
                    className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Prix"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <div className="col-span-2 text-sm font-semibold text-gray-700 px-1">
                    {line.total.toFixed(2)} DH
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="col-span-1 text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-4 text-blue-600 hover:underline text-sm font-medium"
            >
              + Ajouter une ligne
            </button>
            <div className="mt-4 pt-4 border-t flex justify-end">
              <span className="font-bold text-lg text-gray-800">Total : {total.toFixed(2)} DH</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/orders"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 text-lg"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-500">Chargement...</p></div>}>
      <NewOrderPageContent />
    </Suspense>
  )
}