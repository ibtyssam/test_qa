"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition, useEffect, useRef } from "react"

interface ClientFiltersProps {
  cities: string[]
  channels: string[]
}

export default function ClientFilters({ cities, channels }: ClientFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get("q") || "")
  const status = searchParams.get("status") || ""
  const city = searchParams.get("city") || ""
  const channel = searchParams.get("channel") || ""
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const applyFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      startTransition(() => {
        router.push(`/clients?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    applyFilters({ q })
  }
  
  // Debounce search input - auto-search after 300ms of typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    
    debounceTimerRef.current = setTimeout(() => {
      if (q !== (searchParams.get("q") || "")) {
        applyFilters({ q })
      }
    }, 300)
    
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [q, applyFilters, searchParams])

  const clearFilters = () => {
    setQ("")
    startTransition(() => router.push("/clients"))
  }

  const hasFilters = q || status || city || channel

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom, code ou ville..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50"
        >
          Rechercher
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => applyFilters({ status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="prospect">Prospect</option>
          <option value="inactif">Inactif</option>
        </select>

        <select
          value={city}
          onChange={(e) => applyFilters({ city: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={channel}
          onChange={(e) => applyFilters({ channel: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les canaux</option>
          {channels.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  )
}
