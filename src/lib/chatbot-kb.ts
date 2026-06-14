// ChatBot Knowledge Base - Comprehensive app documentation
export const knowledgeBase = [
  {
    id: "team_count",
    keywords: ["combien", "commercial", "team", "équipe", "nombre", "members", "staff"],
    response: (data: any) =>
      `Vous avez ${data.teamMembers?.length || 0} commerciaux dans l'équipe.${
        data.teamMembers?.length > 0
          ? ` Ils sont : ${data.teamMembers.map((m: any) => m.name).join(", ")}`
          : ""
      }`,
  },
  {
    id: "team_list",
    keywords: ["quels", "commerciaux", "list", "liste", "who", "qui", "members"],
    response: (data: any) =>
      data.teamMembers?.length > 0
        ? `Vos commerciaux : ${data.teamMembers.map((m: any) => `${m.name}`).join(", ")}`
        : "Vous n'avez pas de commerciaux assignés.",
  },
  {
    id: "navigation",
    keywords: ["comment", "utiliser", "navigate", "aller", "accéder", "commencer", "start", "guide"],
    response: () =>
      "📚 **Navigation SalesTrack:**\n" +
      "🏠 **Dashboard** - Vue d'ensemble KPIs et équipe\n" +
      "👥 **Clients** - Liste et détails de tous les clients\n" +
      "📋 **Visites** - Suivi des rendez-vous commerciaux\n" +
      "📦 **Commandes** - Gestion des ventes et devis\n" +
      "👤 **Utilisateurs** (Admin) - Créer/gérer les comptes",
  },
  {
    id: "search_filter",
    keywords: [
      "filtre",
      "recherche",
      "search",
      "filter",
      "comment",
      "trouver",
      "find",
      "query",
    ],
    response: () =>
      "🔍 **Filtres disponibles partout:**\n" +
      "• Recherche texte (nom, code, email)\n" +
      "• Status (Actif, Prospect, Inactif)\n" +
      "• Ville\n" +
      "• Canal (distributeur, détail, etc)\n" +
      "💡 Utilisez le bouton 'Effacer' pour réinitialiser.",
  },
  {
    id: "create_new",
    keywords: ["créer", "nouveau", "ajouter", "create", "new", "add", "plus", "+"],
    response: () =>
      "➕ **Créer un nouvel élément:**\n" +
      "• Bouton '+ Nouveau client' sur Clients\n" +
      "• Bouton '+ Nouvelle visite' sur Visites\n" +
      "• Bouton '+ Nouvelle commande' sur Commandes\n" +
      "Aussi disponible via les action cards sur le dashboard",
  },
  {
    id: "export",
    keywords: ["exporter", "excel", "télécharger", "download", "export", "csv", "file"],
    response: () =>
      "📥 **Export Excel:**\n" +
      "Bouton 'Excel' en haut à droite de chaque liste:\n" +
      "• Clients → clients-YYYY-MM-DD.xlsx\n" +
      "• Visites → visites-YYYY-MM-DD.xlsx\n" +
      "• Commandes → commandes-YYYY-MM-DD.xlsx\n" +
      "Respects vos permissions (ADMIN=tout, MANAGER=équipe, COMMERCIAL=perso)",
  },
  {
    id: "permissions",
    keywords: [
      "permission",
      "accès",
      "access",
      "admin",
      "manager",
      "commercial",
      "role",
      "voir",
      "see",
      "visibility",
    ],
    response: (data: any) => {
      const role = data.role || "COMMERCIAL"
      if (role === "ADMIN") {
        return (
          "👑 **ADMIN - Accès total:**\n" +
          "✅ Tous les clients, visites, commandes\n" +
          "✅ Tous les commerciaux\n" +
          "✅ Gestion des utilisateurs\n" +
          "✅ Tous les exports"
        )
      } else if (role === "MANAGER") {
        return (
          "👔 **MANAGER - Accès équipe:**\n" +
          "✅ Données de votre équipe\n" +
          "✅ Clients de votre équipe\n" +
          "✅ Visites/Commandes équipe\n" +
          "✅ Analytics équipe\n" +
          "❌ Données d'autres équipes"
        )
      } else {
        return (
          "👨‍💼 **COMMERCIAL - Accès personnel:**\n" +
          "✅ Vos clients\n" +
          "✅ Vos visites\n" +
          "✅ Vos commandes\n" +
          "❌ Données d'autres commerciaux"
        )
      }
    },
  },
  {
    id: "client_detail",
    keywords: [
      "client",
      "détail",
      "detail",
      "profile",
      "info",
      "historique",
      "history",
    ],
    response: () =>
      "📋 **Page Client (détail):**\n" +
      "• Infos du client (nom, code, localité, canal)\n" +
      "• Status (Actif/Prospect/Inactif)\n" +
      "• Historique des visites\n" +
      "• Historique des commandes\n" +
      "• Boutons actions : Nouvelle visite, Éditer",
  },
  {
    id: "visit",
    keywords: [
      "visite",
      "rendez",
      "meeting",
      "appointment",
      "visit",
      "object",
      "objet",
    ],
    response: () =>
      "📅 **Visites:**\n" +
      "• Date, heure, status (Visite/Commande)\n" +
      "• Objet (Commercial, Produit, Étude, Problème)\n" +
      "• Raison absence commande\n" +
      "• Commentaires\n" +
      "✏️ Créer depuis dashboard ou page client",
  },
  {
    id: "orders",
    keywords: [
      "commande",
      "devis",
      "order",
      "quote",
      "facture",
      "invoice",
      "vente",
      "sale",
    ],
    response: () =>
      "💰 **Commandes:**\n" +
      "• Date, montant, status (Validée/Annulée/Brouillon)\n" +
      "• Lignes avec quantités et prix\n" +
      "• Client et commercial\n" +
      "• Filter par status\n" +
      "📥 Export Excel disponible",
  },
  {
    id: "dashboard",
    keywords: ["dashboard", "accueil", "home", "page", "principal", "main", "kpi"],
    response: () =>
      "📊 **Dashboard:**\n" +
      "• KPIs : Visites totales, Aujourd'hui, Taux transformation %, Clients\n" +
      "• Quick actions : Clients, Nouvelle visite, Commandes\n" +
      "• Stats par commercial (ADMIN/MANAGER)\n" +
      "🤖 ChatBot Assistant (vous l'utilisez là!)",
  },
  {
    id: "status",
    keywords: [
      "status",
      "statut",
      "état",
      "actif",
      "active",
      "prospect",
      "inactif",
      "inactive",
    ],
    response: () =>
      "🏷️ **Status des clients:**\n" +
      "• **Actif** - Client régulier qui achète\n" +
      "• **Prospect** - Potentiel client en prospection\n" +
      "• **Inactif** - Ne commande plus\n\n" +
      "📦 **Status des commandes:**\n" +
      "• **Validée** - Confirmée\n" +
      "• **Annulée** - Rejetée\n" +
      "• **Brouillon** - Non finalisée",
  },
  {
    id: "logout",
    keywords: ["déconnexion", "logout", "quitter", "exit", "leave"],
    response: () => "🚪 **Déconnexion:**\n• Bouton 'Déconnexion' en haut à droite\n• Retour à la page d'accueil",
  },
  {
    id: "edit_client",
    keywords: ["éditer", "edit", "modifier", "change", "update"],
    response: () =>
      "✏️ **Modifier un client (ADMIN seulement):**\n" +
      "• Bouton 'Éditer' sur page client\n" +
      "• Changez les infos\n" +
      "• Sauvegardez avec 'Enregistrer'",
  },
  {
    id: "conversion_rate",
    keywords: ["taux", "conversion", "rate", "pourcentage", "%", "transforme"],
    response: () =>
      "📈 **Taux de transformation:**\n" +
      "= (Nombre de commandes) / (Nombre de visites) × 100%\n" +
      "Exemple: 3 commandes sur 10 visites = 30%\n" +
      "📊 Voir sur Dashboard et stats par commercial",
  },
  {
    id: "ca_revenue",
    keywords: ["ca", "revenue", "chiffre", "affaires", "total", "montant", "income"],
    response: () =>
      "💵 **Chiffre d'affaires (CA):**\n" +
      "= Somme des montants de toutes les commandes validées\n" +
      "📊 Visible dans les stats par commercial\n" +
      "📥 Téléchargez en Excel pour analyse détaillée",
  },
  {
    id: "help",
    keywords: ["aide", "help", "support", "problème", "issue", "bug", "erreur"],
    response: () =>
      "❓ **Besoin d'aide?**\n" +
      "Questions courantes:\n" +
      "• 'Comment créer un client?'\n" +
      "• 'Combien de commerciaux?'\n" +
      "• 'Comment exporter?'\n" +
      "• 'Quelles sont mes permissions?'\n" +
      "• 'Comment utiliser les filtres?'\n\n" +
      "Posez votre question en français courant! 🤖",
  },
]

export function searchKnowledgeBase(question: string, context: any): string {
  const lowerQ = question.toLowerCase().trim()

  // Clean up accents for better matching
  const cleanStr = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  const cleanedQ = cleanStr(lowerQ)

  // Find best match based on keyword overlap
  let bestMatch = null
  let maxScore = 0

  for (const item of knowledgeBase) {
    const matchingKeywords = item.keywords.filter((kw) => cleanStr(kw).includes(cleanedQ) || cleanedQ.includes(cleanStr(kw)))

    if (matchingKeywords.length > maxScore) {
      maxScore = matchingKeywords.length
      bestMatch = item
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch.response(context)
  }

  // If no match, return helpful fallback
  return (
    "Hmm, je n'ai pas trouvé la réponse. 🤔\n\n" +
    "Essayez de poser la question différemment ou consultez les suggestions ci-dessous:\n" +
    "• 'Comment utiliser?' pour un guide\n" +
    "• 'Quels sont les statuts?'\n" +
    "• 'Comment créer?'\n" +
    "• 'Mes permissions?'"
  )
}
