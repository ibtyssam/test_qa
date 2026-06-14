"use client"
import { useState, useEffect } from "react"

interface AIInsightCardProps {
  title: string
  icon: string
  endpoint: string
  params?: Record<string, any>
  loading?: boolean
}

export default function AIInsightCard({ title, icon, endpoint, params = {} }: AIInsightCardProps) {
  const [insight, setInsight] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setLoading(true)
        const response = await fetch(endpoint, {
          method: endpoint.includes("manager") ? "GET" : "POST",
          headers: { "Content-Type": "application/json" },
          body: !endpoint.includes("manager") ? JSON.stringify(params) : undefined,
        })

        if (!response.ok) throw new Error("Failed to fetch insight")

        const data = await response.json()
        const key = endpoint.includes("customer") ? "insight" : endpoint.includes("sales") ? "coaching" : "insight"
        setInsight(data[key] || "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading insight")
      } finally {
        setLoading(false)
      }
    }

    fetchInsight()
  }, [endpoint, params])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-gray-800 text-sm">
          {title}
          <span className="ml-1 text-xs text-blue-600">✨ AI</span>
        </h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-2 bg-blue-200 rounded w-3/4"></div>
          <div className="h-2 bg-blue-200 rounded w-1/2"></div>
        </div>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
      )}
    </div>
  )
}
