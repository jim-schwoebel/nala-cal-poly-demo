# Nala Sales & Marketing Docs — Design Spec

## Overview

A suite of six marketing documents in `docs/sales/` designed to convert tech enthusiasts and early adopters into Nala users. The funnel drives visitors from first impression (social posts, forum threads) to a hosted landing page where they try the demo.

**Target audience:** Tech enthusiasts / early adopters — people who love trying cutting-edge browser tech (WebGPU, local AI), hang out on HN/Reddit/Discord, and are drawn to projects that push boundaries.

**Conversion action:** Visit a landing page and try a hosted demo.

**Tone:** Playful, quirky, slightly cheeky. Nala has personality — like a clever cat who happens to be an AI. Copy should feel like a smart friend showing you something cool, not a corporate product page. Technically credible but never dry.

## Brand Voice & Core Messaging

### Core value proposition

> "An AI voice assistant that lives in your browser, runs on your GPU, and never phones home."

### Three messaging pillars

| Pillar | Hook | Detail |
|--------|------|--------|
| **Local-first AI** | "Your GPU, your rules" | LLM runs entirely in-browser via WebGPU. No API keys, no cloud, no per-request costs. |
| **Zero dependencies** | "No accounts. No subscriptions. No kidding." | No sign-ups, no API tokens, no third-party services. Open a tab, start talking. |
| **Cutting-edge tech** | "The future shipped early" | WebGPU + WebLLM + Web Speech API — bleeding-edge browser tech stacked together into something that actually works. |

### Tagline candidates

- "Talk to your browser. It talks back."
- "AI that runs where you do — in the browser."
- "No cloud. No cost. No kidding."

## Document Suite

Six documents, each serving a specific point in the marketing funnel.

### 1. `landing-page-copy.md`

**Purpose:** Website-ready copy that can be dropped into any CMS or static site.

**Sections:**
- **Hero** — headline, subheadline, CTA button text
- **How it works** — 3-step visual flow (Open tab → Talk → Nala responds)
- **Feature highlights** — 4-5 blocks with playful headers and short descriptions
- **Social proof placeholder** — space for quotes/stats once available
- **Final CTA** — conversion-focused close

### 2. `one-pager.md`

**Purpose:** Shareable product overview for posting on HN, Reddit, Discord, dev communities.

**Sections:**
- What Nala is (2 sentences)
- How it works (tech stack in plain English)
- Why it matters (differentiators)
- Try it (link to demo)

Tone: concise, technically credible, slightly irreverent.

### 3. `user-segments.md`

**Purpose:** Deep-dive on the primary user segment with room to add more later.

**Sections:**
- **Persona profile** — who they are, what they care about, where they hang out
- **Pain points** — what's broken about current assistants for them
- **Messaging hooks** — specific angles that resonate with this audience
- **Objections** — what might make them hesitate, and how to address it

Primary segment: tech enthusiasts / early adopters.

### 4. `feature-matrix.md`

**Purpose:** Competitive comparison table that makes Nala's strengths obvious.

**Competitors:** Siri, Alexa, Google Assistant, ChatGPT Voice.

**Dimensions:** Privacy, cost, offline capability, setup friction, customizability, open source, runs in browser, model quality, ecosystem integrations.

Honest where Nala doesn't win (model quality vs. GPT-4, no smart home integrations). This builds credibility with technically savvy users.

### 5. `faq.md`

**Purpose:** Objection-handling disguised as friendly Q&A. ~10-12 questions.

**Categories:**
- Technical requirements ("Do I need a beefy GPU?", "What browsers work?")
- Privacy claims ("How private is it really?", "What data gets stored?")
- Quality concerns ("Is it as good as ChatGPT?", "What model does it run?")
- Practical usage ("Can I use it on my phone?", "Does it work offline?")

Tone: honest, playful, no corporate deflection. If something is a limitation, say so with charm.

### 6. `social-copy.md`

**Purpose:** Ready-to-post copy for launch channels, tailored to each platform's culture.

**Platforms:**
- **Product Hunt** — tagline, description, first comment
- **Hacker News** — title + Show HN post body
- **Twitter/X** — 3-4 tweet variants (announcement, technical, provocative), with character counts
- **Reddit** — r/webdev, r/LocalLLaMA, r/SideProject post drafts

## File Structure

```
docs/
└── sales/
    ├── landing-page-copy.md
    ├── one-pager.md
    ├── user-segments.md
    ├── feature-matrix.md
    ├── faq.md
    └── social-copy.md
```

## Conventions

- All files in `kebab-case.md` matching project naming standards
- Each doc starts with `# Title` and a brief "Purpose" line
- Markdown throughout — no proprietary formats
- Copy is final-draft quality, ready to use or lightly customize
- Feature matrix uses standard markdown tables
- Social copy includes character counts where platform limits apply
