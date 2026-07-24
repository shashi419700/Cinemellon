export interface MovieSummary {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  tagline?: string;
  rating?: number;
}

export interface TimelineEvent {
  label: string;
  detail: string;
}

export interface CastMember {
  actor: string;
  character: string;
}

export interface CastAndCrew {
  mainCast: CastMember[];
  supportingCast: string[];
  cinematographer: string;
  musicComposer: string;
  editor: string;
  costumeDesigner: string;
  vfxSupervisor: string;
}

export interface CharacterProfile {
  name: string;
  motivation: string;
  arc: string;
  relationships: string;
  psychologicalProfile: string;
  symbolicMeaning: string;
}

export interface EndingExplained {
  breakdown: string;
  symbolism: string;
  whatHappened: string;
  alternateInterpretations: string[];
}

export interface Cinematography {
  cameraStyle: string;
  colorPalette: string;
  lighting: string;
  aspectRatio: string;
  notableShots: string[];
  visualStorytelling: string;
}

export interface SoundAndMusic {
  composer: string;
  signatureSoundtrack: string;
  backgroundScoreStyle: string;
  soundDesign: string;
  memorableSongs: string[];
}

export interface AwardsRecognition {
  oscars: string[];
  bafta: string[];
  cannes: string[];
  goldenGlobes: string[];
  festivalAwards: string[];
  majorNominations: string[];
}

export interface Reception {
  criticalReviews: string;
  audienceResponse: string;
  boxOffice: string;
  cultStatus: string;
}

export interface Legacy {
  culturalImpact: string;
  influenceOnLaterFilms: string;
  internetMemes: string;
  fanTheories: string;
  sequelsSpinoffs: string;
}

export interface MovieDetails extends MovieSummary {
  genres: string[];
  runtimeMinutes: number;
  director: string;
  rating: number; // out of 10
  spoilerFreeSummary: string;
  castAndCrew: CastAndCrew;
  trivia: string[];
  timeline: TimelineEvent[];
  hiddenDetails: string[];
  easterEggs: string[];
  characterAnalysis: CharacterProfile[];
  endingExplained: EndingExplained;
  cinematography: Cinematography;
  soundAndMusic: SoundAndMusic;
  iconicQuotes: { quote: string; character: string }[];
  awards: AwardsRecognition;
  reception: Reception;
  legacy: Legacy;
  similarMovies: MovieSummary[];
}

export interface DiscussionThread {
  id: string;
  title: string;
  excerpt: string;
  sourceName: string;
  sourceUrl: string;
  commentCount: number;
  movieTitle: string;
}

export interface AIInsightRequest {
  movieTitle: string;
  section: "trivia" | "timeline" | "hiddenDetails" | "easterEggs" | "quotes";
}

export interface AIInsightResponse {
  content: string[];
  model: "anthropic" | "gemini";
}

export type MediaType = "movie" | "series";

/** TV show equivalent of MovieSummary — used for search results and cards. */
export interface TvShowSummary {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  tagline?: string;
  rating?: number;
}

/** TV shows intentionally don't get the same depth of AI-generated
 * editorial content movies do — this is genuine, complete factual data
 * straight from TVmaze: overview, cast, genres, network, and status. */
export interface TvShowDetails extends TvShowSummary {
  overview: string;
  genres: string[];
  network: string;
  status: string;
  seasons: number;
  episodes: number;
  runtimeMinutes: number;
  cast: string[];
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}
