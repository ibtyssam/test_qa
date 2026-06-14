"use client"
import { useState } from "react"

interface ChatBotProps {
  role: string
  teamMembers: any[]
}

export default function ChatBot({ role, teamMembers }: ChatBotProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()
      setAnswer(data.answer || "Erreur lors du traitement")
      setQuestion("")
    } catch (error) {
      setAnswer("❌ Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    "Meilleur commercial?",
    "Total CA?",
    "Combien de clients?",
    "Stats cette semaine?",
    "Taux conversion?",
  ]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow p-5 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="font-bold text-gray-800">Assistant SalesTrack</h3>
          <p className="text-xs text-gray-600">Posez vos questions sur l'app et votre équipe</p>
        </div>
      </div>

      <form onSubmit={handleAsk} className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez une question... Ex: Combien de commerciaux ?"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "..." : "Envoyer"}
        </button>
      </form>

      {/* Suggested questions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestedQuestions.map((sq) => (
          <button
            key={sq}
            onClick={async () => {
              setQuestion(sq)
              setLoading(true)
              try {
                const res = await fetch("/api/chatbot", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question: sq }),
                })
                const data = await res.json()
                setAnswer(data.answer || "Erreur lors du traitement")
                setQuestion("")
              } catch (error) {
                setAnswer("❌ Erreur réseau. Réessayez.")
              } finally {
                setLoading(false)
              }
            }}
            className="text-xs bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Answer */}
      {answer && (
        <div className="bg-white border-l-4 border-blue-500 rounded p-3 text-sm whitespace-pre-wrap">
          <p className="text-gray-800">{answer}</p>
        </div>
      )}
    </div>
  )
}
