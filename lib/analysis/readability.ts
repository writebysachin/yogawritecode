export interface ReadabilityResult {
  gradeLevel: number;
  readingEase: number;
  wordCount: number;
  sentenceCount: number;
  passiveSentences: string[];
  adverbs: string[];
  complexSentences: string[];
}

export interface GradeLabel {
  label: string;
  color: string;
}

const ADVERB_EXCLUSIONS = new Set(["only", "family", "early", "apply"]);

const BE_VERBS = new Set([
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
]);

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;
  const groups = clean.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  if (clean.endsWith("e")) count -= 1;
  return Math.max(count, 1);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitWords(text: string): string[] {
  const matches = text.match(/[A-Za-z0-9']+/g);
  return matches ? matches : [];
}

function isPassive(sentence: string): boolean {
  const words = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
  for (let i = 0; i < words.length - 1; i += 1) {
    const current = words[i] as string;
    const next = (words[i + 1] as string).replace(/[^a-z]/g, "");
    if (BE_VERBS.has(current) && next.length > 2 && (next.endsWith("ed") || next.endsWith("en"))) {
      return true;
    }
  }
  return false;
}

function findAdverbs(sentence: string): string[] {
  const words = sentence.match(/[A-Za-z']+/g) ?? [];
  const found: string[] = [];
  for (const word of words) {
    const lower = word.toLowerCase();
    if (lower.endsWith("ly") && lower.length > 2 && !ADVERB_EXCLUSIONS.has(lower)) {
      found.push(word);
    }
  }
  return found;
}

export function analyzeReadability(text: string): ReadabilityResult {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  if (wordCount === 0 || sentenceCount === 0) {
    return {
      gradeLevel: 0,
      readingEase: 0,
      wordCount,
      sentenceCount,
      passiveSentences: [],
      adverbs: [],
      complexSentences: [],
    };
  }

  let syllables = 0;
  for (const word of words) {
    syllables += countSyllables(word);
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllables / wordCount;

  const gradeLevel = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const readingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  const passiveSentences: string[] = [];
  const adverbs: string[] = [];
  const complexSentences: string[] = [];

  for (const sentence of sentences) {
    if (isPassive(sentence)) passiveSentences.push(sentence);
    adverbs.push(...findAdverbs(sentence));
    if (splitWords(sentence).length >= 25) complexSentences.push(sentence);
  }

  return {
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    readingEase: Math.round(readingEase * 10) / 10,
    wordCount,
    sentenceCount,
    passiveSentences,
    adverbs,
    complexSentences,
  };
}

export function gradeLabel(grade: number): GradeLabel {
  if (grade <= 6) return { label: "Easy", color: "#15803D" };
  if (grade <= 9) return { label: "Moderate", color: "#B45309" };
  return { label: "Hard", color: "#B91C1C" };
}
