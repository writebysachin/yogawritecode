import { z } from "zod";
import { generateWithBedrock } from "./bedrock";
import { extractWebsiteSignals } from "./extract";
import { isMockAIMode } from "./provider";

const SectionDraftSchema = z.object({ content: z.string().min(1) });

export type SectionInput = {
  websiteUrl: string;
  heading: string;
  purpose: string;
  points: string[];
  current?: string;
  mode: "draft" | "improve";
};

function promptFor(input: SectionInput, signalsText: string) {
  const toneInstruction = `Write in a clear, direct tone — short sentences, plain English, no jargon. Explain things like you would to a smart friend who is not an expert. Avoid filler phrases like "it's important to note", "in conclusion", "leverage", "utilize", or "paradigm".`;

  if (input.mode === "improve") {
    return `Rewrite this article section to be clearer and more useful. ${toneInstruction}

Keep the same meaning but:
- Cut any sentence that doesn't add new information
- Replace vague claims with specific examples or numbers where possible
- Break up long sentences
- Remove passive voice

Section heading: ${input.heading}
Current draft:
${input.current ?? ""}
${signalsText}

Return JSON: { "content": the improved markdown for this section }.`;
  }

  return `Write one section of a blog post. ${toneInstruction}

Section heading: ${input.heading}
What this section should explain: ${input.purpose}
Points to cover: ${input.points.join("; ") || "the heading topic"}
${signalsText}

Guidelines:
- Open with the most important point, not a preamble
- Use short paragraphs (2–3 sentences max)
- Use a bullet list only if there are 3+ parallel items
- Be specific — give examples, numbers, or scenarios
- Do not repeat the heading in the first sentence

Return JSON: { "content": markdown string for this section }.`;
}

export async function generateSection(input: SectionInput): Promise<string> {
  if (isMockAIMode()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (input.mode === "improve" && input.current) {
      return `${input.current.trim()}\n\n- In practice, teams see the biggest gains from ${input.points[0] ?? "a clear process"} first.\n- Measure before and after to track the difference.`;
    }
    return `${input.purpose ? `${input.purpose}\n\n` : ""}${input.points
      .map((p) => `- ${p}`)
      .join("\n")}\n\n_(Mock draft — set AI_MODE=bedrock for real content.)_`;
  }

  const signals = await extractWebsiteSignals(input.websiteUrl);
  const signalsText = signals.textLength
    ? `Business context: ${signals.title || signals.host}${signals.metaDescription ? ` — ${signals.metaDescription}` : ""}. Key terms: ${signals.topTerms.slice(0, 5).join(", ")}.`
    : `Business context: ${signals.host}.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await generateWithBedrock({ user: promptFor(input, signalsText), maxTokens: 1500 });
    try {
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = SectionDraftSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) return parsed.data.content;
    } catch {
      console.error("[sections] invalid JSON on attempt", attempt + 1);
    }
    if (attempt === 1) throw new Error("AI section draft failed validation.");
  }
  throw new Error("AI section draft failed validation.");
}
