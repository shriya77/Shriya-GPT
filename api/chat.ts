// api/chat.ts
// Vercel Node.js Function (Web Standard "fetch" handler)
// Docs: Vercel Node runtime supports `export default { async fetch(request) {} }` :contentReference[oaicite:0]{index=0}
//
// Requirements:
//   npm i openai
//   .env (local) / Vercel env vars:
//     OPENAI_API_KEY=...
//     OPENAI_MODEL=gpt-4o-mini   (or whatever you prefer)

import OpenAI from "openai"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type Role = "user" | "assistant" | "system"
type ChatMessage = { role: Role; content: string }

const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

function jsonNoStore(body: any, init?: ResponseInit) {
  return Response.json(body, {
    ...(init || {}),
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers || {}),
    },
  })
}

type Mode = "Recruiter" | "Technical" | "Casual" | "One-liner"

type ChatRequestBody = {
  messages?: ChatMessage[]
  mode?: Mode
  jobDescription?: string
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

// --- tiny in-memory rate limit (good enough for a portfolio) ---
const WINDOW_MS = 60_000
const MAX_REQ_PER_WINDOW = 20
const hits = new Map<string, { count: number; windowStart: number }>()

function rateLimit(ip: string) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return { ok: true }
  }
  entry.count += 1
  hits.set(ip, entry)
  if (entry.count > MAX_REQ_PER_WINDOW) return { ok: false }
  return { ok: true }
}

// --- helpers to load your portfolio data (optional but goated) ---
async function readTextSafe(relPath: string): Promise<string | null> {
  // Try multiple possible paths in order
  const possiblePaths = [
    // Relative to function directory (Vercel deployment with includeFiles)
    path.join(__dirname, relPath),
    // Go up one level then to api/data (if function is in .vercel/build)
    path.join(__dirname, "../", relPath),
    // Relative to project root (local development)
    path.join(process.cwd(), relPath),
    // Explicit api/data path from project root
    path.join(process.cwd(), "api", relPath),
    // If relPath already includes "api/", try it directly
    relPath.startsWith("api/") ? path.join(process.cwd(), relPath) : null,
  ].filter((p): p is string => p !== null)

  for (const absPath of possiblePaths) {
    try {
      const content = await readFile(absPath, "utf8")
      console.log(`[chat] loaded file: ${relPath} from ${absPath}`)
      return content
    } catch (err) {
      // Try next path
      continue
    }
  }

  // If all paths failed, log the error
  console.error(`[chat] failed to load file: ${relPath}`, {
    __dirname,
    cwd: process.cwd(),
    triedPaths: possiblePaths,
  })
  return null
}

async function loadPortfolioContext() {
  // These are optional. If they don't exist yet, we fall back gracefully.
  // Try both paths: relative to API directory and relative to project root
  const profile = (await readTextSafe("data/profile.json")) || (await readTextSafe("api/data/profile.json"))
  const projects = (await readTextSafe("data/projects.json")) || (await readTextSafe("api/data/projects.json"))
  const stories = (await readTextSafe("data/stories.json")) || (await readTextSafe("api/data/stories.json"))
  const resume = (await readTextSafe("data/resume.json")) || (await readTextSafe("api/data/resume.json"))
  const styleRules = (await readTextSafe("data/styleRules.md")) || (await readTextSafe("api/data/styleRules.md"))

  const hasData = !!(profile || projects || stories || resume || styleRules)
  console.log("[chat] portfolio context loaded", {
    hasProfile: !!profile,
    hasProjects: !!projects,
    hasStories: !!stories,
    hasResume: !!resume,
    hasStyleRules: !!styleRules,
    hasAnyData: hasData,
  })

  if (!hasData) {
    console.warn("[chat] WARNING: No portfolio data files found! Model may hallucinate.")
  }

  return {
    profile,
    projects,
    stories,
    resume,
    styleRules,
  }
}

function modeGuidance(mode: Mode | undefined) {
  switch (mode) {
    case "Recruiter":
      return [
        "Keep it skimmable: 4–8 bullets max.",
        "Lead with role-fit + impact + proof.",
        "Avoid deep implementation unless asked.",
      ].join("\n")
    case "Technical":
      return [
        "Be technical and specific (architecture, tradeoffs, edge cases).",
        "Use short sections: Approach / Tradeoffs / Results.",
        "If you mention a project, tie it to concrete implementation details.",
      ].join("\n")
    case "Casual":
      return [
        "Sound like Shriya: confident, direct, human.",
        "No corporate fluff. Still keep it professional.",
      ].join("\n")
    case "One-liner":
      return "Answer in 1–2 sentences max. If needed, add ONE bullet with proof."
    default:
      return "Be concise, specific, and helpful."
  }
}

function normalizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  const out: ChatMessage[] = []
  for (const m of raw) {
    if (
      m &&
      typeof m === "object" &&
      (m as any).role &&
      (m as any).content &&
      typeof (m as any).role === "string" &&
      typeof (m as any).content === "string"
    ) {
      const role = (m as any).role as Role
      if (role === "user" || role === "assistant" || role === "system") {
        out.push({ role, content: (m as any).content })
      }
    }
  }
  return out.slice(-30) // keep context bounded
}

export default {
  async fetch(request: Request) {
    let requestId = "unknown"
    try {
      requestId =
        request.headers.get("x-vercel-id") ||
        request.headers.get("x-request-id") ||
        crypto.randomUUID()
      const startedAt = Date.now()
      if (request.method !== "POST") {
        return jsonNoStore(
          { error: "Method not allowed. Use POST.", requestId },
          { status: 405 }
        )
      }

      if (!process.env.OPENAI_API_KEY) {
        return jsonNoStore(
          { error: "Missing OPENAI_API_KEY on the server.", requestId },
          { status: 500 }
        )
      }

      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"

      const rl = rateLimit(ip)
      if (!rl.ok) {
        return jsonNoStore(
          { error: "Rate limit exceeded. Try again in a minute.", requestId },
          { status: 429 }
        )
      }

      let body: ChatRequestBody = {}
      try {
        body = (await request.json()) as ChatRequestBody
      } catch (e: any) {
        console.error("[chat] bad json", { requestId, err: e?.message || String(e) })
        return jsonNoStore(
          {
            error: "Invalid JSON body",
            requestId,
          },
          { status: 400 }
        )
      }
      const messages = normalizeMessages(body.messages)
      const mode = body.mode
      const jobDescription =
        typeof body.jobDescription === "string" ? body.jobDescription.trim() : ""

      const portfolio = await loadPortfolioContext()

      const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || ""
      const deploymentUrl = process.env.VERCEL_URL || ""

      console.log("[chat] start", {
        requestId,
        ip,
        mode,
        hasJobDescription: Boolean(jobDescription),
        messages: messages.length,
        model: MODEL,
        commitSha,
      })

      // System prompt: tight, specific, “Shriya voice”, with your rules.
      const systemPrompt = `
You are **ShriyaGPT**, an interactive portfolio agent representing Shriya Kalyan.

ROLE & PERSPECTIVE (STRICT)

- You are "ShriyaGPT", an AI portfolio agent representing Shriya Kalyan.
- The USER is a recruiter, interviewer, or visitor.
- Always speak about Shriya in THIRD PERSON (she/her).
- Never assume the user is Shriya.

PRONOUN DISAMBIGUATION RULES

- If the user says "my experience", "my resume", "my projects", or similar,
  interpret it as referring to SHRIYA’S experience and still respond in third person.
- If the user says "my company", "my team", "our product", or "our users",
  interpret it as referring to the USER’s organization — not Shriya’s.
- When the meaning is ambiguous, ask a brief clarifying question before assuming.

OWNERSHIP RULES

- Do NOT attribute companies, products, or teams to Shriya unless explicitly stated in the portfolio data.
- Do NOT say "Shriya’s company" unless the project is clearly marked as founded or owned by her.
- For internships or roles, describe Shriya as a contributor, engineer, or lead — not owner.

VOICE RULES

- Avoid second-person ("you").
- Do not ask follow-up questions unless they meaningfully improve relevance.
- Responses should sound confident, precise, and recruiter-facing.

Use the portfolio data provided below as the single source of truth.

GOAL
- Help recruiters and engineers evaluate Shriya quickly.
- Be specific and evidence-based. Never answer with “no data,” “not in my data,” or anything equivalent.
- If something is missing, infer the best possible answer from whatever IS available, and label the uncertainty briefly.

VOICE (IMPORTANT)
- Direct, confident, human.
- No corporate fluff.
- Avoid these transitions: Accordingly, Additionally, Consequently, Hence, However, Indeed, Moreover, Nevertheless, Nonetheless, Notwithstanding, Thus, Undoubtedly.
- Avoid buzzword spam and excessive em-dashes.

FORMAT (MANDATORY)
- Use Markdown.
- Default structure:
  - 1-line headline summary
  - 3–6 bullet points max
  - If relevant: "Best proof" (1–2 bullets)
- Keep paragraphs short (max 2 lines).
- Never return a single long block of text.
- If the user asks for a summary, respond with bullets by default.
- Use tables if helpful for visualization of answer
- ${modeGuidance(mode)}

TRUTH & SOURCES
- Primary source of truth is the portfolio context included below (plus the user's message).
- Do not invent metrics, employers, dates, or awards.
- If a direct answer is missing, synthesize a best-effort answer using related details from the portfolio (skills, projects, roles, themes).
- If the portfolio context is empty or irrelevant, use the fallback responses section below (still in third person).

FALLBACK RESPONSES (USE ONLY IF NEEDED)
- If asked for details that are missing, provide what IS known in a helpful shape:
  - "Based on what’s available, Shriya’s strongest fit is __ because __." 
  - "A reasonable approach/answer here is __; exact details aren’t listed, so this is inferred from __." 
- If the user asks for something completely absent (e.g., a specific company/date/metric):
  - Give a concise best-effort answer plus 1–2 safe next steps.
  - Example: "A standard expectation for this role is __. From Shriya’s projects, the closest proof is __." 
- If portfolio context files are all null/empty:
  - "ShriyaGPT can still answer generally: here’s a crisp overview of how Shriya approaches __ and what to look at next (resume/projects)."
- Never output: "Not in my data yet", "No data", "I don't have enough info" as the final answer.
- Keep the format rules: 1-line headline + 3–6 bullets + optional “Best proof”.

PORTFOLIO CONTEXT
${portfolio.styleRules ? `\n[styleRules.md]\n${portfolio.styleRules}\n` : ""}
${portfolio.profile ? `\n[profile.json]\n${portfolio.profile}\n` : ""}
${portfolio.projects ? `\n[projects.json]\n${portfolio.projects}\n` : ""}
${portfolio.stories ? `\n[stories.json]\n${portfolio.stories}\n` : ""}
${portfolio.resume ? `\n[resume.json]\n${portfolio.resume}\n` : ""}

If jobDescription is provided, tailor the answer to it: call out the best-matching projects and explain why. If exact evidence is missing, make a best-effort match using related skills/roles and label the inference briefly.
`.trim()

      const input: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...(jobDescription
          ? ([
              {
                role: "user",
                content:
                  "Job description (for tailoring):\n" + jobDescription,
              },
            ] as ChatMessage[])
          : []),
        ...messages,
      ]

      // Use standard Chat Completions API
      const resp = await client.chat.completions.create({
        model: MODEL,
        messages: input,
        temperature: 0.7,
        max_tokens: 1000,
      })

      const reply = resp.choices[0]?.message?.content?.trim() || ""

      if (!reply) {
        console.error("[chat] empty reply", {
          requestId,
          model: MODEL,
          response: resp,
        })
        return jsonNoStore(
          {
            error: "Upstream returned empty response",
            requestId,
          },
          { status: 500 }
        )
      }

      const durationMs = Date.now() - startedAt
      console.log("[chat] ok", { requestId, durationMs })

      return jsonNoStore({
        reply,
        requestId,
        meta: {
          durationMs,
          model: MODEL,
          commitSha,
          deploymentUrl,
        },
        // You can extend later with structured fields like:
        // projectIds: [],
      })
    } catch (err: any) {
      console.error("[chat] server error", {
        requestId,
        err: typeof err?.message === "string" ? err.message : String(err),
      })

      return jsonNoStore(
        {
          error: "Server error",
          details: typeof err?.message === "string" ? err.message : String(err),
          requestId,
        },
        { status: 500 }
      )
    }
  },
}
