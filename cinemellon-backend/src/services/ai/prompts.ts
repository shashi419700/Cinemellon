import { AIInsightSection } from "../../types.js";

/**
 * Both providers support forcing structured JSON output against a schema
 * (Anthropic via forced tool-use, Gemini via responseSchema) — see
 * anthropic.ts / gemini.ts. Defining the shape once here and sharing it
 * between both keeps their outputs actually comparable, and means there's
 * one place to update if a MovieDetails field ever changes.
 */

const stringArray = { type: "array", items: { type: "string" } };

/** Everything in MovieDetails that TMDB doesn't provide, minus
 * similarMovies — the model returns similar-movie *titles* here as a
 * fallback source only; movieAssembly.ts prefers TMDB's own recommendation
 * data first and only resolves these titles (via a TMDB search per title)
 * when that comes back empty, since the model can't know what ids this
 * system will assign or what TMDB actually has posters/ratings for. */
export const fullInsightSchema = {
  type: "object",
  properties: {
    spoilerFreeSummary: { type: "string" },
    trivia: stringArray,
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, detail: { type: "string" } },
        required: ["label", "detail"],
      },
    },
    hiddenDetails: stringArray,
    easterEggs: stringArray,
    characterAnalysis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          motivation: { type: "string" },
          arc: { type: "string" },
          relationships: { type: "string" },
          psychologicalProfile: { type: "string" },
          symbolicMeaning: { type: "string" },
        },
        required: ["name", "motivation", "arc", "relationships", "psychologicalProfile", "symbolicMeaning"],
      },
    },
    endingExplained: {
      type: "object",
      properties: {
        breakdown: { type: "string" },
        symbolism: { type: "string" },
        whatHappened: { type: "string" },
        alternateInterpretations: stringArray,
      },
      required: ["breakdown", "symbolism", "whatHappened", "alternateInterpretations"],
    },
    cinematography: {
      type: "object",
      properties: {
        cameraStyle: { type: "string" },
        colorPalette: { type: "string" },
        lighting: { type: "string" },
        aspectRatio: { type: "string" },
        notableShots: stringArray,
        visualStorytelling: { type: "string" },
      },
      required: ["cameraStyle", "colorPalette", "lighting", "aspectRatio", "notableShots", "visualStorytelling"],
    },
    soundAndMusic: {
      type: "object",
      properties: {
        composer: { type: "string" },
        signatureSoundtrack: { type: "string" },
        backgroundScoreStyle: { type: "string" },
        soundDesign: { type: "string" },
        memorableSongs: stringArray,
      },
      required: ["composer", "signatureSoundtrack", "backgroundScoreStyle", "soundDesign", "memorableSongs"],
    },
    iconicQuotes: {
      type: "array",
      items: {
        type: "object",
        properties: { quote: { type: "string" }, character: { type: "string" } },
        required: ["quote", "character"],
      },
    },
    awards: {
      type: "object",
      properties: {
        oscars: stringArray,
        bafta: stringArray,
        cannes: stringArray,
        goldenGlobes: stringArray,
        festivalAwards: stringArray,
        majorNominations: stringArray,
      },
      required: ["oscars", "bafta", "cannes", "goldenGlobes", "festivalAwards", "majorNominations"],
    },
    reception: {
      type: "object",
      properties: {
        criticalReviews: { type: "string" },
        audienceResponse: { type: "string" },
        boxOffice: { type: "string" },
        cultStatus: { type: "string" },
      },
      required: ["criticalReviews", "audienceResponse", "boxOffice", "cultStatus"],
    },
    legacy: {
      type: "object",
      properties: {
        culturalImpact: { type: "string" },
        influenceOnLaterFilms: { type: "string" },
        internetMemes: { type: "string" },
        fanTheories: { type: "string" },
        sequelsSpinoffs: { type: "string" },
      },
      required: ["culturalImpact", "influenceOnLaterFilms", "internetMemes", "fanTheories", "sequelsSpinoffs"],
    },
    similarMovieTitles: {
      type: "array",
      items: { type: "string" },
      description: "2-4 real film titles genuinely similar in tone, theme, or genre — not this film itself.",
    },
  },
  required: [
    "spoilerFreeSummary",
    "trivia",
    "timeline",
    "hiddenDetails",
    "easterEggs",
    "characterAnalysis",
    "endingExplained",
    "cinematography",
    "soundAndMusic",
    "iconicQuotes",
    "awards",
    "reception",
    "legacy",
    "similarMovieTitles",
  ],
} as const;

export function buildFullInsightPrompt(title: string, year: number, director: string, overview: string): string {
  return `You are writing editorial content for Cinemellon, a movie exploration app, about the film "${title}" (${year}), directed by ${director}.

Official synopsis for reference: ${overview || "(none available)"}

Write rich, specific, well-informed content for every field in the schema, grounded in what's actually true about this film — real trivia, a real plot timeline, real cast/character dynamics, the film's real critical and cultural reception. Avoid vague filler ("a visually stunning film with great performances") in favor of specific, concrete detail a genuine fan or critic would write. It's fine, and expected, for endingExplained and characterAnalysis to include spoilers — this app shows spoiler content behind its own UI gate, so don't hedge or avoid revealing the ending.

If you're not confident about a specific fact (an award, a box office figure), prefer a general but still substantive statement over inventing a precise-sounding number you're not sure of.`;
}

const sectionInstructions: Record<AIInsightSection, string> = {
  trivia: "Generate 4-6 specific, verifiable trivia facts about the making of this film — production details, casting decisions, behind-the-scenes anecdotes. Avoid generic statements.",
  timeline: 'Generate 4-6 major plot beats in chronological order. Format each item as a single string: "<short label>: <one-sentence detail>" — for example "The Heist: Cobb\'s team infiltrates the target\'s dream." This should read as a spoiler-inclusive plot timeline.',
  hiddenDetails: "Generate 3-5 subtle details a first-time viewer would likely miss — visual motifs, foreshadowing, callbacks, or continuity choices that reward close attention.",
  easterEggs: "Generate 2-4 easter eggs or deliberate references in the film — nods to other works, filmmaker signatures, or hidden jokes.",
  quotes: 'Generate 3-5 of the film\'s most iconic or quotable lines. Format each item as a single string: "<the quote>" — <character name>, including the quotation marks and em dash exactly as shown.',
};

export function buildSectionPrompt(movieTitle: string, section: AIInsightSection): { prompt: string; schema: object } {
  return {
    prompt: `You are regenerating one section of editorial content for "${movieTitle}" on Cinemellon, a movie exploration app.

${sectionInstructions[section]}

Give a genuinely different set of items than a typical first pass would produce — the person clicked "regenerate" because they want fresh angles, not a rephrasing of the obvious ones. Stay factually grounded in the real film.`,
    schema: {
      type: "object",
      properties: { items: stringArray },
      required: ["items"],
    },
  };
}
