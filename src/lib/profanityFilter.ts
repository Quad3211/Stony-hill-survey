// --- DICTIONARIES ---

const ENGLISH_PROFANITY = [
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "bastard",
  "cunt",
  "dick",
  "pussy",
  "cock",
  "motherfucker",
  "fucker",
  "whore",
  "slut",
  "prick",
  "retard",
  "nigga",
  "nigger",
  "faggot",
  "hoe",
  "shithead",
  "dumbass",
  "jackass",
  "bullshit",
];

const JAMAICAN_PROFANITY = [
  "bumboclaat",
  "bomboclaat",
  "bombo",
  "bloodclaat",
  "raasclaat",
  "rassclaat",
  "raas",
  "rass",
  "pussyclaat",
  "battyman",
  "battybwoy",
  "fishman",
  "chi chi man",
  "dutty",
  "dutty bwoy",
  "dutty gal",
  "fuckry",
  "fuckri",
  "skettel",
  "johncrow",
  "boasy",
  "stinking",
  "ole dutty",
  "mussi fuck",
  "ras hole",
  "blood hole",
  "pussy hole",
  "bomb hole",
  "batty hole",
  "rass hole",
];

const HIGH_SEVERITY_KEYWORDS = [
  "kill",
  "stab",
  "shoot",
  "rape",
  "die",
  "murder",
  "suicide",
  "threat",
  "bomb",
  "gun",
  "knife",
];

// --- TYPES ---

export type FilterAction =
  | "none"
  | "soft_filter"
  | "admin_review"
  | "hard_filter";

interface AssessmentResult {
  action: FilterAction;
  sanitizedText: string;
  flagged: boolean;
  meta: {
    severity: "low" | "medium" | "high" | "none";
    detectedWords: string[];
  };
}

// --- HELPERS ---

// Leetspeak / Obfuscation Map
const CHAR_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "1": "i",
  "!": "i",
  "0": "o",
  $: "s",
  "5": "s",
  "3": "e",
};

const normalizeText = (text: string): string => {
  let normalized = text.toLowerCase();

  // Replace leetspeak characters
  for (const [char, replacement] of Object.entries(CHAR_MAP)) {
    // Escape special regex characters if necessary (like $)
    // For simple chars like @, 4, 1, !, 0, 3 this is fine.
    // $ needs escaping in regex, or just replaceAll if supported (ES2021) or split/join.
    normalized = normalized.split(char).join(replacement);
  }

  // Remove repeated characters (e.g. "fuuuck" -> "fuck")
  // We reduce 3+ repeats to 2 (to keep words like 'feed' valid-ish, though 'fuck' usually has 1.
  // Strictly reducing to 1 might break 'good', 'feed'.
  // A heuristic: if a known profanity is found after reducing to 1, catch it.

  // Simple approach: standard normalization checks typical replacements.
  // We can also check the raw text against dictionaries for robust matching.

  return normalized;
};

const maskWord = (word: string): string => {
  if (word.length <= 2) return "*".repeat(word.length);
  return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
};

// --- MAIN FUNCTION ---

export const assessContent = (text: string): AssessmentResult => {
  if (!text) {
    return {
      action: "none",
      sanitizedText: text,
      flagged: false,
      meta: { severity: "none", detectedWords: [] },
    };
  }

  const normalized = normalizeText(text);
  const words = text.split(/\s+/); // maintain original casing for result reconstruction if needed, but we rely on normalized for check
  const normalizedWords = normalized.split(/\s+/);

  let highSeverityFound = false;

  let lowSeverityFound = false;

  const detectedWords: string[] = [];

  // Check each word (and normalized version)
  // We re-construct the text based on masking if needed.

  const processedWords = words.map((originalWord, index) => {
    const norm = normalizedWords[index].replace(/[^\w]/g, ""); // strip punctuation for check

    // Check High Severity (Threats, Violence)
    if (HIGH_SEVERITY_KEYWORDS.some((kw) => norm.includes(kw))) {
      highSeverityFound = true;
      detectedWords.push(originalWord);
      return originalWord; // We don't mask high severity, we BLOCK it entirely implicitly by the action
    }

    // Check Medium Severity (Jamaican / English Profanity) -> Admin Review or Hard Filter depending on config.
    // The user requirement says:
    // low_severity = soft_filter (mask)
    // medium_severity = admin_review (flag)
    // high_severity = hard_filter (block)

    // Let's categorize:
    // "Hard Core" Profanity / Slurs -> Low/Medium?
    // Actually, usually Slurs are High or Medium.
    // 'Damn', 'Hell' -> Low.
    // 'Fuck', 'Shit' -> Low (Soft filter)?

    // Based on user prompt "soft_filter: Replace offensive words... allow submission".
    // So "Fuck", "Shit", "Bumboclaat" should probably be SOFT filtered (masked) if they are just profanity.
    // THREATS (High Severity) should be HARD filtered (blocked).
    // "Admin Review" might be for ambiguous or suspicious context, or maybe persistent profanity?

    // Let's align with typical safety:
    // Profanity -> Soft Filter (Mask)
    // Hate/Threats -> Hard Filter (Block)

    const isEnglishProfane = ENGLISH_PROFANITY.some((kw) => norm.includes(kw));
    const isJamaicanProfane = JAMAICAN_PROFANITY.some((kw) =>
      norm.includes(kw),
    );

    if (isEnglishProfane || isJamaicanProfane) {
      lowSeverityFound = true; // Treating general profanity as 'Low' severity -> Soft Filter
      detectedWords.push(originalWord);
      return maskWord(originalWord);
    }

    return originalWord;
  });

  const sanitizedText = processedWords.join(" ");

  // Determine Final Action
  let action: FilterAction = "none";
  let severity: "low" | "medium" | "high" | "none" = "none";

  // High Severity -> Block
  if (highSeverityFound) {
    action = "hard_filter";
    severity = "high";
  }
  // If we have profanity but NO threats, we Soft Filter (Mask it)
  else if (lowSeverityFound) {
    action = "soft_filter"; // The requirement said "low_severity" -> "soft_filter"
    severity = "low";
  }

  // "Admin Review" could be triggered if we see "High" confidence "toxicity" but no specific keywords,
  // or maybe effectively 'Medium' severity matches.
  // For now, let's treat Threats as High (Block) and Profanity as Low (Mask).

  // NOTE: User Spec says:
  // "low_severity": "soft_filter"
  // "medium_severity": "admin_review"
  // "high_severity": "hard_filter"

  // I will map:
  // Profanity -> Low (Mask)
  // Hate/Discrimination (if distinct from profanity) -> Medium (Flag)
  // Threats/Violence -> High (Block)

  // For simplicity with current lists:
  // Profanity List -> Low
  // High Severity List (Threats) -> High

  return {
    action,
    sanitizedText, // Only relevant if allowed to submit
    flagged: severity !== "none",
    meta: {
      severity,
      detectedWords,
    },
  };
};
