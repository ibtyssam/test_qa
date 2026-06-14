import Anthropic from "@anthropic-ai/sdk"

const isDemoMode = process.env.AI_DEMO_MODE === "true"

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

export async function generateCustomerInsight(data: {
  customerName: string
  city: string
  channel: string
  status: string
  recentVisits: Array<{
    date: string
    status: string
    object: string
    noOrderReason?: string
    comment?: string
  }>
  recentOrders: Array<{
    date: string
    total: number
    type: string
    status: string
  }>
}): Promise<string> {
  // Demo mode
  if (isDemoMode) {
    const orderCount = data.recentOrders.length
    const visitCount = data.recentVisits.length
    const insights = [
      `${data.customerName} shows strong engagement with ${orderCount} recent orders. Focus on maintaining momentum with regular follow-ups to drive Q2 growth.`,
      `${data.customerName} (${data.channel}) has visited ${visitCount} times recently but conversion needs work. Tailor next visit to address ${data.recentVisits[0]?.noOrderReason || "objections"}.`,
      `${data.customerName} in ${data.city} demonstrates loyalty with consistent purchases. Opportunity to cross-sell complementary products in their next order.`,
      `${data.customerName} is a high-value prospect in the ${data.channel} channel. Previous visit noted ${data.recentVisits[0]?.comment || "good feedback"} - leverage this in upcoming pitch.`,
    ]
    return insights[Math.floor(Math.random() * insights.length)]
  }

  const prompt = `Analyze this customer and provide a brief AI insight card (2-3 sentences max):

Customer: ${data.customerName}
Location: ${data.city}
Channel: ${data.channel}
Status: ${data.status}

Recent Visits (last 3):
${data.recentVisits.map((v) => `- ${v.date}: ${v.status} - ${v.object}${v.noOrderReason ? ` (Reason: ${v.noOrderReason})` : ""}`).join("\n")}

Recent Orders (last 3):
${data.recentOrders.map((o) => `- ${o.date}: ${o.type} - ${o.total} DH (${o.status})`).join("\n")}

Provide:
1. Key observation about customer behavior
2. Specific recommendation for next visit

Format: Be concise, professional, and actionable.`

  const message = await getAnthropicClient().messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  })

  return message.content[0].type === "text" ? message.content[0].text : ""
}

export async function generateSalesCoaching(data: {
  customerName: string
  lastVisitReason?: string
  lastNoOrderReason?: string
  orderFrequency: number
  channel: string
  category: string
}): Promise<string> {
  // Demo mode
  if (isDemoMode) {
    const tips = [
      `• Lead with value: Highlight cost savings vs competitors\n• Address objections: Prepare counter-arguments for "${data.lastNoOrderReason || "budget concerns"}"\n• Close strategy: Bundle with complementary product to increase order value`,
      `• Emphasize loyalty: Remind of 12-month relationship and consistent quality\n• Probe deeper: Ask about unmet needs in their current supply chain\n• Offer incentive: Propose volume discount for multi-order commitment`,
      `• Build urgency: Reference market trends affecting their sector\n• Educate: Share case study of similar customer achieving 20% margin improvement\n• Negotiate: Offer flexible payment terms to reduce procurement friction`,
      `• Start with rapport: Comment on recent achievements in their market\n• Demo advantage: Show product improvements since last visit\n• Secure commitment: Ask for pilot order or trial period agreement`,
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  const prompt = `Generate a sales coaching tip for this visit (max 3 bullet points):

Customer: ${data.customerName}
Channel: ${data.channel}
Category: ${data.category}
Last no-order reason: ${data.lastNoOrderReason || "Not specified"}
Average orders per month: ${data.orderFrequency}

Provide concise, actionable coaching tips:
- What angle to use
- What to discuss
- Potential objection and how to handle

Keep it brief and practical.`

  const message = await getAnthropicClient().messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 250,
    messages: [{ role: "user", content: prompt }],
  })

  return message.content[0].type === "text" ? message.content[0].text : ""
}

export async function generateManagerInsight(data: {
  teamName: string
  commercials: Array<{
    name: string
    visitCount: number
    orderCount: number
    conversionRate: number
    totalCA: number
  }>
  periodDays: number
}): Promise<string> {
  // Demo mode
  if (isDemoMode) {
    const topPerformer = data.commercials.reduce((a, b) => (a.totalCA > b.totalCA ? a : b), data.commercials[0])
    const teamTotal = data.commercials.reduce((sum, c) => sum + c.totalCA, 0)
    const avgConversion = (data.commercials.reduce((sum, c) => sum + c.conversionRate, 0) / data.commercials.length).toFixed(1)
    
    return `🏆 Top performer: ${topPerformer.name} with ${topPerformer.totalCA.toLocaleString()}DH CA (${topPerformer.conversionRate}% conversion). Team generated ${teamTotal.toLocaleString()}DH this period with ${avgConversion}% avg conversion. Action item: Conduct peer coaching session with bottom performer to share ${topPerformer.name}'s winning strategies for Q2.`
  }

  const prompt = `Generate a 1-minute manager briefing about team performance:

Team: ${data.teamName}
Period: Last ${data.periodDays} days

Team Members:
${data.commercials.map((c) => `- ${c.name}: ${c.visitCount} visits, ${c.orderCount} orders (${c.conversionRate}% conversion), ${c.totalCA} DH CA`).join("\n")}

Provide:
1. Top performer highlight
2. One development opportunity
3. One action item

Keep it executive-level and motivational.`

  const message = await getAnthropicClient().messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  })

  return message.content[0].type === "text" ? message.content[0].text : ""
}
