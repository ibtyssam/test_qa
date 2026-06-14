"use client"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Déconnexion en cours...</p>
    </div>
  )
}