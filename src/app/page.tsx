import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PublicNavbar from "@/components/PublicNavbar"

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-4">
              Pilotage commercial terrain
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Centralisez vos visites, clients et commandes en un seul outil
            </h1>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-8">
              SalesTrack remplace les fichiers Excel, WhatsApp et échanges informels par une
              application web unique pour les commerciaux terrain, leurs managers et la direction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-center hover:bg-blue-50 transition shadow-lg"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-white/10 transition"
              >
                Créer un compte commercial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contexte */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Le problème que SalesTrack résout
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Un distributeur agro-alimentaire s&apos;appuie sur des commerciaux terrain qui visitent
              des points de vente, suivent leur portefeuille clients et remontent des informations
              depuis le réseau de distribution.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aujourd&apos;hui, ces informations sont dispersées. SalesTrack les centralise pour
              améliorer la couverture commerciale, le taux de transformation visite → commande
              et la visibilité pour la direction.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Objectifs clés</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                Saisie terrain rapide, utilisable sur smartphone
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                Données filtrées selon le rôle connecté
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                Tableau de bord avec indicateurs de performance
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                Gestion clients, visites et commandes/devis
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
            Modules principaux
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Une base fonctionnelle couvrant l&apos;essentiel du pilotage commercial au quotidien.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "👥",
                title: "Clients",
                desc: "Fiches clients avec recherche, filtres et portefeuille par commercial.",
              },
              {
                icon: "📋",
                title: "Visites",
                desc: "Saisie rapide avec statut commande/non-commande et raison libre.",
              },
              {
                icon: "📦",
                title: "Commandes & Devis",
                desc: "Lignes produits avec quantités, prix unitaire et total calculé.",
              },
              {
                icon: "📊",
                title: "Tableau de bord",
                desc: "Visites, taux de transformation et KPIs adaptés à chaque rôle.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition"
              >
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4">
          Trois profils, trois expériences
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Chaque utilisateur voit uniquement les données correspondant à son périmètre.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              role: "Administrateur",
              color: "border-purple-500 bg-purple-50",
              badge: "bg-purple-100 text-purple-700",
              desc: "Vision globale de la plateforme. Accès à tous les clients, visites, commandes et indicateurs. Gestion des utilisateurs.",
            },
            {
              role: "Manager",
              color: "border-blue-500 bg-blue-50",
              badge: "bg-blue-100 text-blue-700",
              desc: "Suivi de son équipe commerciale. Accès aux données des commerciaux rattachés et à leurs performances.",
            },
            {
              role: "Commercial",
              color: "border-green-500 bg-green-50",
              badge: "bg-green-100 text-green-700",
              desc: "Interface terrain prioritaire : mes clients, nouvelle visite en 2 clics, mes commandes et mon tableau de bord.",
            },
          ].map((r) => (
            <div key={r.role} className={`rounded-xl p-6 border-l-4 ${r.color}`}>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${r.badge}`}>
                {r.role}
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo accounts */}
      <section id="demo" className="bg-blue-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Comptes de démonstration
          </h2>
          <p className="text-blue-200 text-center mb-10">
            Connectez-vous avec l&apos;un de ces comptes pour tester chaque rôle.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { role: "Admin", email: "admin@salestrack.com", password: "admin123" },
              { role: "Manager", email: "manager@salestrack.com", password: "manager123" },
              { role: "Commercial", email: "commercial1@salestrack.com", password: "commercial123" },
            ].map((a) => (
              <div key={a.email} className="bg-blue-800 rounded-xl p-5 border border-blue-700">
                <p className="font-bold text-lg mb-3">{a.role}</p>
                <p className="text-blue-200 text-sm font-mono">{a.email}</p>
                <p className="text-blue-300 text-sm font-mono mt-1">{a.password}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/login"
              className="inline-block bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              Accéder à l&apos;application →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="font-semibold text-white mb-1">SalesTrack</p>
          <p>Application de pilotage commercial</p>
        </div>
      </footer>
    </div>
  )
}
