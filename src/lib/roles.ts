export function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN": return "Administrateur"
    case "MANAGER": return "Manager"
    case "COMMERCIAL": return "Commercial"
    default: return role
  }
}

export function getRoleDescription(role: string): string {
  switch (role) {
    case "ADMIN": return "Vision globale : tous les clients, visites, commandes et indicateurs."
    case "MANAGER": return "Vision equipe : clients, visites et commandes de vos commerciaux."
    case "COMMERCIAL": return "Vision personnelle : vos clients, visites et commandes."
    default: return ""
  }
}