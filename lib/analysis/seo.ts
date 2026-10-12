export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface SeoResult {
  score: number;
  checks: SeoCheck[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countWords(text: string): number {
  const matches = text.match(/[A-Za-z0-9']+/g);
  return matches ? matches.length : 0;
}

function countHeadings(content: string): number {
  let count = 0;
  for (const line of content.split("\n")) {
    if (/^#{1,6}\s+\S/.test(line.trim())) count += 1;
  }
  return count;
}

function getParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^#{1,6}\s/.test(p));
}

function getFirstParagraph(content: string): string {
  const paragraphs = getParagraphs(content);
  return paragraphs.length > 0 ? (paragraphs[0] as string) : "";
}

export function analyzeSeo(content: string, targetKeyword: string, title: string): SeoResult {
  const keyword = targetKeyword.trim();
  const wordCount = countWords(content);
  const escaped = escapeRegExp(keyword);
  const keywordRegex = keyword.length > 0 ? new RegExp(escaped, "gi") : null;
  const titleRegex = keyword.length > 0 ? new RegExp(escaped, "i") : null;

  const occurrences = keywordRegex ? (content.match(keywordRegex) ?? []).length : 0;
  const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;

  const firstParagraph = getFirstParagraph(content);
  const paragraphs = getParagraphs(content);
  const totalParagraphWords = paragraphs.reduce((sum, p) => sum + countWords(p), 0);
  const avgParagraph = paragraphs.length > 0 ? totalParagraphWords / paragraphs.length : 0;

  const checks: SeoCheck[] = [
    {
      id: "word-count",
      label: "Word count 800+",
      passed: wordCount >= 800,
    },
    {
      id: "keyword-title",
      label: "Keyword in title",
      passed: keyword.length > 0 && titleRegex !== null && titleRegex.test(title),
    },
    {
      id: "keyword-first-paragraph",
      label: "Keyword in first paragraph",
      passed:
        keyword.length > 0 &&
        firstParagraph.length > 0 &&
        (keywordRegex as RegExp).test(firstParagraph),
    },
    {
      id: "keyword-density",
      label: "Keyword density 0.5–2.5%",
      passed: keyword.length > 0 && density >= 0.5 && density <= 2.5,
    },
    {
      id: "headings",
      label: "At least 3 markdown headings",
      passed: countHeadings(content) >= 3,
    },
    {
      id: "paragraph-length",
      label: "Avg paragraph under 60 words",
      passed: paragraphs.length > 0 && avgParagraph < 60,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}
