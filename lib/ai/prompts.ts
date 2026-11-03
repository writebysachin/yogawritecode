export const PROMPT_VERSION = "2026-11-02";

const JSON_RULE =
  "Respond ONLY with valid JSON matching the requested shape. No markdown, no HTML, no commentary.";

export function websiteAnalysisPrompt(url: string, websiteText: string | null) {
  return `You are a content strategist helping a business owner find the best topics to write about.

Website: ${url}
${websiteText ? `Page signals: ${websiteText}` : "No page text available — infer from the URL and domain."}

Identify 3–5 specific content opportunities this business should write about. Each opportunity must be:
- Grounded in what this business actually does (not generic advice)
- Targeting a real question or problem their audience has
- Achievable to rank for given the site's likely authority

Return JSON with exactly this shape:
{
  companySummary,
  productCategory,
  targetAudience,
  positioning,
  opportunities: [{
    title,
    description,
    opportunityScore (0-100),
    difficulty ("low" | "medium" | "hard"),
    businessRelevance ("low" | "medium" | "high"),
    searchIntent ("informational" | "commercial" | "transactional" | "navigational"),
    funnelStage ("top" | "middle" | "bottom"),
    reason,
    keywords (array of 3-5 specific search phrases a real user would type into Google)
  }]
}

${JSON_RULE}`;
}

export function topicClusterPrompt(
  ctx: { opportunityTitle: string; companySummary: string },
  websiteSignals?: string,
) {
  return `You are building a topic cluster plan for a content team.

Main topic: ${ctx.opportunityTitle}
Business: ${ctx.companySummary}
${websiteSignals ? `Website context: ${websiteSignals}\n` : ""}

Create a pillar-and-cluster structure. The pillar topic is the main article. Supporting topics are shorter articles that link back to it. Internal linking suggestions are practical anchor text ideas.

Return JSON with EXACTLY this shape — every value must be a plain string, no nested objects:
{
  "pillarTopic": "string — the main pillar article title",
  "supportingTopics": ["string title", "string title", "string title"],
  "searchIntent": "informational" | "commercial" | "transactional" | "navigational",
  "priority": "low" | "medium" | "high",
  "internalLinkingSuggestions": ["string anchor text idea", "string anchor text idea"]
}

Each element in supportingTopics and internalLinkingSuggestions must be a plain string, not an object.

${JSON_RULE}`;
}

export function seoBriefPrompt(
  ctx: { opportunityTitle: string; targetAudience: string },
  websiteSignals?: string,
) {
  return `You are writing an SEO brief for a content writer (human or AI).

Article topic: ${ctx.opportunityTitle}
Target reader: ${ctx.targetAudience}
${websiteSignals ? `Website context: ${websiteSignals}\n` : ""}

The brief must give the writer everything they need:
- The exact primary keyword to target
- Real questions the audience is searching for
- Specific headings to use (not vague, e.g. "How to reduce churn in 30 days" not "Introduction")
- Entities to mention (brands, tools, concepts, people)
- Competitor angle (what the top results cover and what gap this article should fill)

Return JSON: { primaryKeyword, searchIntent, targetAudience, suggestedHeadings[], questionsToAnswer[], entitiesToMention[], competitorInsights[] }

${JSON_RULE}`;
}

export function articleOutlinePrompt(
  ctx: {
    opportunityTitle: string;
    opportunityDescription?: string;
    companySummary?: string;
    targetAudience?: string;
  },
  websiteSignals?: string,
) {
  return `You are creating a detailed article outline that a writer can follow section by section.

Article topic: ${ctx.opportunityTitle}
${ctx.opportunityDescription ? `Full context: ${ctx.opportunityDescription}\n` : ""}${ctx.companySummary ? `Business: ${ctx.companySummary}\n` : ""}${ctx.targetAudience ? `Target reader: ${ctx.targetAudience}\n` : ""}${websiteSignals ? `Website signals: ${websiteSignals}\n` : ""}
Rules for a good outline:
- title is the internal working title (concise, keyword-rich)
- h1 is the exact published headline — specific, keyword-rich, not clickbait
- Each section heading is concrete (e.g. "How to reduce churn in 30 days" not "Tips")
- purpose explains what the reader will understand after reading that section (one sentence)
- points are specific, actionable sub-items the writer must cover — not vague bullets
- No filler sections like "Introduction" or "Conclusion" without real substance
- 5–8 sections is ideal; never fewer than 4

Return JSON: { title, h1, sections: [{ heading, purpose, points[] }] }

${JSON_RULE}`;
}
