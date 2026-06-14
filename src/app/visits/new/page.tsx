"use client"
import { Suspense, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

function NewVisitPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientId: searchParams.get("clientId") || "",
    object: "prise de commande",
    comment: "",
    status: "commande",
    noOrderReason: "",
  })

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push("/visits")
    } else {
      alert("Erreur lors de la création de la visite")
      setLoading(false)
    }
  }

  const user = session?.user as any

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar userName={user.name} role={user.role} />}

      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/visits" className="text-blue-600 hover:underline text-sm">← Visites</Link>
          <h2 className="text-2xl font-bold text-gray-800">Nouvelle visite</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la visite *</label>
            <select
              value={form.object}
              onChange={(e) => setForm({ ...form, object: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="prise de commande">Prise de commande</option>
              <option value="suivi client">Suivi client</option>
              <option value="recouvrement">Recouvrement</option>
              <option value="visibilité marque">Visibilité marque</option>
              <option value="implantation produit">Implantation produit</option>
              <option value="négociation">Négociation</option>
              <option value="livraison">Livraison</option>
              <option value="relance">Relance</option>
              <option value="prospection">Prospection</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Commentaire libre..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Résultat *</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "commande", noOrderReason: "" })}
                className={`flex-1 py-4 rounded-lg font-semibold border-2 transition text-lg ${
                  form.status === "commande"
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 text-gray-600 hover:border-green-400"
                }`}
              >
                ✅ Commande
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "non-commande" })}
                className={`flex-1 py-4 rounded-lg font-semibold border-2 transition text-lg ${
                  form.status === "non-commande"
                    ? "bg-red-500 text-white border-red-500"
                    : "border-gray-300 text-gray-600 hover:border-red-400"
                }`}
              >
                ❌ Non-commande
              </button>
            </div>
          </div>

          {form.status === "non-commande" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison *</label>
              <select
                value={form.noOrderReason}
                onChange={(e) => setForm({ ...form, noOrderReason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une raison</option>
                <option value="stock non écoulé">Stock non écoulé</option>
                <option value="trop de stock">Trop de stock</option>
                <option value="baisse d'activité">Baisse d'activité</option>
                <option value="changement de fournisseur">Changement de fournisseur</option>
                <option value="prix trop élevé">Prix trop élevé</option>
                <option value="client absent">Client absent</option>
                <option value="attente validation direction">Attente validation direction</option>
                <option value="problème de livraison">Problème de livraison</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/visits"
              className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 text-lg"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewVisitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-500">Chargement...</p></div>}>
      <NewVisitPageContent />
    </Suspense>
  )
}