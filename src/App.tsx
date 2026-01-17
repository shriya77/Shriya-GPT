import ReactMarkdown from "react-markdown"
import { useMemo, useRef, useState } from "react"

type Role = "user" | "assistant"

type Message = {
  id: string
  role: Role
  content: string
}

const quickActions = [
  "Summarize my experience in 30 seconds",
  "Compare me to my peers",
  "What's something not on my resume",
  "Which project best shows my ability",
  "How do I learn fast",
  "How does my work hold up under scale",
]

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function IconLinkedIn(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("block", props.className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.004V9h3.082v1.561h.044c.429-.812 1.476-1.67 3.037-1.67 3.248 0 3.847 2.139 3.847 4.922v6.639zM5.337 7.433a1.79 1.79 0 1 1 0-3.58 1.79 1.79 0 0 1 0 3.58zM6.956 20.452H3.717V9h3.239v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconGitHub(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("block", props.className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M12 .5C5.73.5.75 5.58.75 12.02c0 5.15 3.29 9.52 7.86 11.06.58.11.79-.26.79-.56v-2.02c-3.2.71-3.87-1.58-3.87-1.58-.53-1.38-1.3-1.75-1.3-1.75-1.06-.75.08-.74.08-.74 1.17.08 1.78 1.24 1.78 1.24 1.04 1.84 2.73 1.31 3.4 1 .11-.77.41-1.31.74-1.61-2.55-.3-5.23-1.31-5.23-5.83 0-1.29.45-2.34 1.18-3.16-.12-.3-.51-1.52.11-3.17 0 0 .97-.32 3.18 1.2.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.52 3.17-1.2 3.17-1.2.62 1.65.23 2.87.11 3.17.73.82 1.18 1.87 1.18 3.16 0 4.53-2.69 5.53-5.25 5.82.42.38.79 1.12.79 2.26v3.35c0 .31.21.68.8.56 4.56-1.54 7.85-5.91 7.85-11.06C23.25 5.58 18.27.5 12 .5z" />
    </svg>
  )
}

function IconSparkle(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <path d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z" />
      <path d="M19 13l.7 3 2.3.8-2.3.8-.7 3-.7-3-2.3-.8 2.3-.8.7-3z" />
    </svg>
  )
}

function IconSend(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function IconFile(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

const modeChips: Array<{ id: string; label: string; helper: string }> = [
  { id: "recruiter", label: "Recruiter", helper: "Tight, polished" },
  { id: "technical", label: "Technical", helper: "More detail" },
  { id: "casual", label: "Casual", helper: "More me" },
  { id: "one", label: "One-liner", helper: "Shortest" },
]

type Project = {
  id: string
  title: string
  type: string
  oneLiner: string
  stack: string[]
  whatIBuilt: string[]
  constraints: string[]
  impact: string[]
  whyItMatters: string
}

const PROJECT_DATA: Project[] = [
  {
    id: "tech-me-kid-booking",
    title: "Tech Me Kid Booking Platform",
    type: "Production system",
    oneLiner: "Full-stack booking platform serving 15,000+ users with automated matching and scheduling.",
    stack: ["React", "Python", "REST APIs", "PostgreSQL"],
    whatIBuilt: [
      "Designed and implemented backend services and APIs for booking and scheduling",
      "Built preference-based matching logic across time zones and availability",
      "Integrated third-party services for calendar and session automation",
    ],
    constraints: ["Real users with inconsistent availability", "Time zone edge cases", "External API reliability"],
    impact: ["Used by 15,000+ seniors in production", "Reduced manual scheduling overhead for operations teams"],
    whyItMatters:
      "This project proves I can ship and maintain systems with real users, real data, and real failure modes.",
  },
  {
    id: "outamation-ocr-rag",
    title: "OCR + RAG Document Pipelines",
    type: "AI production workflow",
    oneLiner: "OCR and retrieval pipelines for large mortgage document sets, reducing manual review time by ~70%.",
    stack: ["Python", "Tesseract", "PaddleOCR", "PyMuPDF", "LlamaIndex", "RAG"],
    whatIBuilt: [
      "OCR pipelines for 200+ page mortgage documents",
      "Document parsing and normalization workflows",
      "Semantic retrieval using RAG with tuned chunking strategies",
    ],
    constraints: ["Messy, inconsistent document formats", "Accuracy mattered more than speed", "Large document sizes"],
    impact: ["Reduced manual document review time by ~70%", "Improved retrieval precision across heterogeneous files"],
    whyItMatters:
      "Small implementation details directly affected correctness, making this a strong example of my attention to detail in AI systems.",
  },
  {
    id: "materna",
    title: "Materna",
    type: "Founder-led product",
    oneLiner: "Hackathon-winning maternal health app built from idea to MVP with real traction.",
    stack: ["Django", "React", "PostgreSQL", "Firebase"],
    whatIBuilt: [
      "Led backend and product development",
      "Translated user research into technical requirements",
      "Coordinated engineering, research, and marketing teams",
    ],
    constraints: ["Ambiguous problem space", "Cross-functional coordination", "Tight hackathon timelines"],
    impact: ["Won Axxess Hackathon (350+ participants)", "Built 104-user waitlist pre-launch"],
    whyItMatters: "Shows end-to-end execution: problem selection, system design, leadership, and shipping.",
  },
  {
    id: "lumina-astronomy-app",
    title: "Lumina",
    type: "Award-winning mobile app",
    oneLiner: "Astronomy + stargazing app that won Best UI/UX, with a polished interface and real-world usability focus.",
    stack: ["React Native", "JavaScript", "APIs"],
    whatIBuilt: [
      "Designed the UI system and core user flows for discovery and viewing",
      "Implemented the front-end experience with reusable components",
      "Integrated external data/APIs to power the app experience",
    ],
    constraints: ["High bar for UI polish", "Mobile performance and responsiveness", "Data quality and API edge cases"],
    impact: ["Won Best UI/UX at a design competition", "Demonstrated strong product design + engineering execution"],
    whyItMatters: "Shows I can build product-ready interfaces and ship experiences people actually want to use.",
  },
]

// Keywords to detect project mentions in messages
const PROJECT_KEYWORDS: Record<string, string[]> = {
  "tech-me-kid-booking": ["tech me kid", "booking platform", "tmk", "15,000", "15k", "scheduling", "seniors"],
  "outamation-ocr-rag": [
    "outamation",
    "ocr",
    "rag",
    "document",
    "mortgage",
    "llamaindex",
    "tesseract",
    "70%",
    "retrieval",
  ],
  materna: ["materna", "maternal health", "hackathon", "axxess", "waitlist", "104"],
  "lumina-astronomy-app": ["lumina", "astronomy", "stargazing", "best design", "best ui", "ui/ux"],
}

export default function App() {
  const [mode, setMode] = useState<string>("recruiter")
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "m1",
      role: "assistant",
      content:
        "Hi I'm Shriya. Ask me about my skills, experience or paste a job description and I'll map it to my best work.",
    },
  ])

  const listRef = useRef<HTMLDivElement | null>(null)

  const links = useMemo(
    () => ({
      linkedin: "https://www.linkedin.com/in/shriya77/",
      github: "https://github.com/shriya77",
      resume: "/Shriya_Kalyan_Resume.pdf",
    }),
    []
  )

  // Detect which projects are mentioned in messages
  const mentionedProjects = useMemo(() => {
    const allText = messages.map((m) => m.content.toLowerCase()).join(" ")
    const detected: Set<string> = new Set()

    Object.entries(PROJECT_KEYWORDS).forEach(([projectId, keywords]) => {
      if (keywords.some((keyword) => allText.includes(keyword.toLowerCase()))) {
        detected.add(projectId)
      }
    })

    return PROJECT_DATA.filter((p) => detected.has(p.id))
  }, [messages])

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = listRef.current
      if (!el) return
      el.scrollTop = el.scrollHeight
    })
  }

  // Map frontend mode to API mode format
  function mapModeToAPI(mode: string): "Recruiter" | "Technical" | "Casual" | "One-liner" {
    switch (mode.toLowerCase()) {
      case "recruiter":
        return "Recruiter"
      case "technical":
        return "Technical"
      case "casual":
        return "Casual"
      case "one":
        return "One-liner"
      default:
        return "Recruiter"
    }
  }

  // Call the chat API
  async function callChatAPI(messages: Message[]): Promise<string> {
    try {
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          mode: mapModeToAPI(mode),
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(error.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.reply || "Sorry, I couldn't generate a response."
    } catch (error) {
      console.error("Chat API error:", error)
      throw error
    }
  }

  function fakeAssistantReply(userText: string): string {
    const trimmed = userText.trim()
    if (!trimmed) return ""

    if (trimmed.toLowerCase().includes("summarize")) {
      return "I'm a CS student who builds product-y full-stack + AI projects. Strong UI taste, fast iteration, and I can explain technical work like a human. Want the 3-sentence recruiter version or the technical version?"
    }

    if (trimmed.toLowerCase().includes("role fit") || trimmed.toLowerCase().includes("fit")) {
      return "Tell me the role title + 3 requirements. I'll match them to my closest projects and give you bullet-ready proof."
    }

    if (mode === "one") {
      return "Got you — ask me for a specific project or role and I'll keep it tight."
    }

    if (mode === "technical") {
      return "Drop the job description (or the problem). I'll respond with: (1) matching projects, (2) tech choices + tradeoffs, (3) what I'd ship first."
    }

    return "Say what you're trying to do (or paste a job description). I'll map it to my best projects and write a clean, recruiter-friendly answer — with proof." 
  }

  async function handleQuickAction(label: string) {
    if (isLoading) return

    const text = label
    setInput("")
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)
    scrollToBottom()

    // Fallback response (use immediately if API fails)
    const assistantText =
      label === "Summarize my experience in 30 seconds"
      ? `I'm a CS student at UT Dallas (3.98 GPA) who builds systems meant to be used, not just demoed. I've shipped a full-stack booking platform at Tech Me Kid serving 15,000+ real users, handling scheduling, preference-based matching, and edge cases across time zones. At Outamation, I built OCR + RAG pipelines for large mortgage documents (200+ pages), cutting manual review time by ~70%. I also founded Materna, a hackathon-winning health-tech product, where I led a 45-person cross-functional team from idea to MVP and built a 100+ user waitlist pre-launch. My strength is taking messy problems and turning them into production-ready backend and AI systems.`

      : label === "Compare me to my peers"
      ? `Most students build projects to show skills. I build systems that have users, constraints, and consequences. My work has handled real traffic (15,000+ users), real data (large, messy financial documents), and real failure modes. I've had to think about edge cases, performance, tradeoffs, and what breaks in practice. On top of that, I combine backend and AI depth with product sense and design taste (Best Design at Lumina). That combination—shipping + judgment + polish—is what separates me from most early-career candidates.`

      : label === "What's something not on my resume"
      ? `I'm unusually calm in ambiguous situations. I'm comfortable starting with incomplete information, figuring out what actually matters, and moving forward anyway. Outside of that, I'm multilingual (native Tamil, professional Spanish), which has helped me work across cultures and teams. I also tutor calculus weekly, which has sharpened my ability to explain complex ideas clearly—an underrated engineering skill. And while I care deeply about technical quality, I also think about business impact, which is why I've studied finance and analytics alongside computer science.`

      : label === "Which project best shows my ability"
      ? `Materna best captures how I work end-to-end. I led it from problem discovery to a working product: translating user pain points into features, making technical tradeoffs, coordinating a 45-person team, and shipping an MVP that won a competitive hackathon and attracted a real waitlist. It shows product judgment, leadership, and execution. That said, if you're evaluating pure backend and AI systems, my work at Outamation—building scalable OCR and RAG pipelines with measurable efficiency gains—is the clearest example of how I design and ship production-grade systems.`

      : label === "How do I learn fast"
      ? `I learn fastest by building under constraints. Instead of staying in tutorial mode, I put myself in situations where something has to work—real users, real data, real deadlines. That's how I picked up RAG and document pipelines at Outamation, and how I learned to design scalable full-stack systems at Tech Me Kid. Teaching also accelerates my learning; tutoring forces me to truly understand concepts rather than memorize them. I also use AI tools strategically to explore unfamiliar codebases and architectures faster, without skipping fundamentals.`

      : label === "How does my work hold up under scale"
      ? `My work has already been tested outside the classroom. At Tech Me Kid, my platform supports thousands of users with complex matching logic and third-party integrations. At Outamation, my pipelines process large, noisy document sets reliably, with clear efficiency gains. I've had to handle edge cases like time zones, inconsistent document formats, and external API failures. I design systems to degrade gracefully, stay observable, and be refactored as usage grows—because real users don't care that something was “just a project.”`

      : "Tell me the role or paste a job description, and I'll map it directly to the most relevant projects, decisions, and impact."

    // Try API first, fall back to pre-written answer
    try {
      const reply = await callChatAPI(updatedMessages)
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      // Use fallback if API fails
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)
    scrollToBottom()

    try {
      const reply = await callChatAPI(updatedMessages)
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      // Fallback to fake reply if API fails
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fakeAssistantReply(text),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 -z-10">
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* glow blobs - premium purple, pink, cyan blend */}
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-24 right-[-120px] h-[520px] w-[520px] rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[12%] h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-160px] right-[10%] h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/15 blur-3xl" />

        {/* subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950" />
      </div>

      {/* header */}
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">SHRIYAGPT</div>
              <div className="text-xs text-white/50">Less scrolling. More answers.</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90 border border-white/10 backdrop-blur hover:bg-white/15 transition transition-all duration-200 hover:scale-105"
            >
              <span className="h-4 w-4 shrink-0">
                <IconLinkedIn className="h-full w-full text-sky-200 group-hover:text-sky-100" />
              </span>
              Connect on LinkedIn
            </a>
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/90 border border-white/10 backdrop-blur hover:bg-white/15 transition transition-all duration-200 hover:scale-105"
            >
              <span className="h-4 w-4 shrink-0">
                <IconGitHub className="h-full w-full text-white/90 group-hover:text-white" />
              </span>
              View GitHub
            </a>
            <a
              href={links.resume}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/90 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-all duration-200 hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              <IconFile className="h-4 w-4" />
              Resume
            </a>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <div className="space-y-8">
          {/* left: hero + chat */}
          <section className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
              <div className="p-8 md:p-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                      Shriya<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">GPT</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-white/65">
                      Ask me anything - this agent knows my projects, resume, and how I actually think.
                    </p>
                  </div>

                  {/* mode chips */}
                  <div className="hidden md:flex items-center flex-wrap gap-2 justify-end">
                    <span className="text-xs text-white/60 mr-1 font-medium">Mode:</span>
                    {modeChips.map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setMode(chip.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs backdrop-blur transition-all duration-200",
                          mode === chip.id
                            ? "bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-cyan-500/25 border-purple-400/40 text-white scale-105 shadow-lg shadow-purple-500/25"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-gradient-to-r hover:from-purple-500/15 hover:via-pink-500/10 hover:to-cyan-500/15 hover:border-purple-400/30 hover:scale-[1.02]"
                        )}
                        title={chip.helper}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* chat history - now at the top */}
                <div className="mt-8">
                  <div className="flex items-center justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => setMessages(messages.slice(0, 1))}
                      className="text-xs text-white/55 hover:text-white/80 transition-colors duration-200"
                    >
                      Clear
                    </button>
                  </div>

                  <div
                    ref={listRef}
                    className="min-h-[400px] max-h-[600px] overflow-auto rounded-2xl p-6"
                  >
                    <div className="space-y-4">
                      {messages.map((m, index) => (
                        <div
                          key={m.id}
                          className={cn(
                            "flex fade-in slide-in-from-bottom-2",
                            m.role === "user" ? "justify-end" : "justify-start"
                          )}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div
                            className={cn(
                              "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all duration-300 hover:scale-[1.02]",
                              m.role === "user"
                                ? "bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-purple-500/20 border-cyan-400/30 text-white shadow-lg shadow-cyan-500/15"
                                : "bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-indigo-500/10 border-purple-400/25 text-white/90 shadow-lg shadow-purple-500/10"
                            )}
                          >
                            <div className="text-[11px] uppercase tracking-wide text-white/45 mb-1">
                              {m.role === "user" ? "You" : "ShriyaGPT"}
                            </div>
                            <ReactMarkdown
                              components={{
                                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-white/90">{children}</li>,
                                p: ({ children }) => <p className="text-white/90 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                h3: ({ children }) => <h3 className="mt-2 font-semibold text-white">{children}</h3>,
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* input - now at the bottom */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/25 via-pink-400/25 to-cyan-400/25 blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-3 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">


                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="What should I know about Shriya?"
                        className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/40 focus:placeholder:text-white/30 transition-colors duration-200"
                      />

                      <button
                        onClick={sendMessage}
                        disabled={isLoading}
                        className="h-10 rounded-xl bg-gradient-to-r from-purple-500/95 via-pink-500/95 to-cyan-500/95 px-4 font-semibold text-white transition-all duration-200 hover:brightness-110 shadow-md shadow-purple-500/30 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        {isLoading ? (
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <IconSend className="h-4 w-4" />
                        )}
                        {isLoading ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {quickActions.map((label, index) => (
                      <button
                        key={label}
                        onClick={() => handleQuickAction(label)}
                        disabled={isLoading}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:border-white/15 transition-all duration-200 hover:scale-105 fade-in slide-in-from-bottom-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                          animationDelay: `${index * 30}ms`,
                          animationFillMode: 'both'
                        }}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* right: evidence panel */}
          <aside>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Proof & Highlights</div>
                    <div className="text-xs text-white/50 mt-1">
                      Cards show up as you talk about projects.
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <IconSparkle className="h-5 w-5 text-white/85" />
                  </div>
                </div>

                <div className="mt-5 space-y-3 max-h-[600px] overflow-y-auto">
                  {mentionedProjects.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4">
                      <div className="text-sm font-semibold">Best for recruiters</div>
                      <div className="mt-2 text-xs text-white/60 leading-relaxed">
                        Ask: "Give me a 3-sentence pitch for SWE internships" or "What are my top 3 projects for AI roles?"
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70 border border-white/10">
                          Proof links
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70 border border-white/10">
                          Metrics
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70 border border-white/10">
                          Role mapping
                        </span>
                      </div>
                    </div>
                  )}

                  {mentionedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 to-pink-500/10 p-4 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold">{project.title}</div>
                          <div className="text-[11px] text-white/50 mt-0.5">{project.type}</div>
                        </div>
                      </div>

                      <div className="text-xs text-white/80 leading-relaxed mt-2">{project.oneLiner}</div>

                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold text-white/70 mb-1">What I Built:</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {project.whatIBuilt.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-[11px] text-white/60 leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-white/70 mb-1">Impact:</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {project.impact.map((item, idx) => (
                              <li key={idx} className="text-[11px] text-white/60 leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {project.stack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70 border border-white/10"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-xs text-white/60 font-medium mb-2">Mode</div>
                  <div className="grid grid-cols-2 gap-2 md:hidden">
                    {modeChips.map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setMode(chip.id)}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-xs backdrop-blur transition-all duration-200",
                          mode === chip.id
                            ? "bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-cyan-500/25 border-purple-400/40 text-white scale-105 shadow-md shadow-purple-500/20"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-gradient-to-r hover:from-purple-500/15 hover:via-pink-500/10 hover:to-cyan-500/15 hover:border-purple-400/30"
                        )}
                        type="button"
                      >
                        <div className="font-semibold">{chip.label}</div>
                        <div className="text-[11px] text-white/45">{chip.helper}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-white/45">
          <div>© {new Date().getFullYear()} ShriyaGPT</div>
        </div>
      </footer>
    </div>
  )
}
