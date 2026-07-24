import { MovieDetails, MovieSummary } from "../types.js";

// Authoring shape: reference other seed movies by id, same as before — the
// transform below resolves these into full displayable summaries (poster,
// year, rating) once, at load time, so each movie's own art/year/rating
// stays defined in exactly one place rather than duplicated everywhere it's
// referenced as a "similar movie".
type SeedMovieRaw = Omit<MovieDetails, "similarMovies"> & { similarMovieIds: string[] };

/**
 * Hand-curated movies, migrated as-is from the frontend's former
 * src/data/mockMovies.ts. These are NOT regenerated or overwritten by the
 * TMDB/AI pipeline in movieAssembly.ts — getMovieById checks this list
 * first and returns a match immediately, exactly as written here. Anything
 * requested that isn't one of these four goes through TMDB + AI generation
 * instead (see services/movieAssembly.ts).
 *
 * Posters still use the placeholder generator for these four — real TMDB
 * posters only kick in for movies resolved through the TMDB pipeline. If
 * you want real posters here too, the simplest path is a one-off script
 * that looks each title up on TMDB and patches posterUrl, rather than
 * doing that lookup on every request for a movie whose data never changes.
 */
const poster = (seed: string, tint: string) =>
  `https://placehold.co/500x750/${tint}/FFFFFF?text=${encodeURIComponent(seed)}`;

const rawSeedMovies: SeedMovieRaw[] = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    tagline: "Your mind is the scene of the crime.",
    posterUrl: poster("Inception", "14171c"),
    genres: ["Sci-Fi", "Thriller"],
    runtimeMinutes: 148,
    director: "Christopher Nolan",
    rating: 8.8,
    spoilerFreeSummary:
      "A thief who steals corporate secrets through dream-sharing technology is given a chance at redemption: plant an idea instead of stealing one. The catch is that inception may be impossible — and his own subconscious is not on his side.",
    castAndCrew: {
      mainCast: [
        { actor: "Leonardo DiCaprio", character: "Dom Cobb" },
        { actor: "Joseph Gordon-Levitt", character: "Arthur" },
        { actor: "Elliot Page", character: "Ariadne" },
        { actor: "Tom Hardy", character: "Eames" },
      ],
      supportingCast: ["Ken Watanabe", "Cillian Murphy", "Marion Cotillard", "Michael Caine"],
      cinematographer: "Wally Pfister",
      musicComposer: "Hans Zimmer",
      editor: "Lee Smith",
      costumeDesigner: "Jeffrey Kurland",
      vfxSupervisor: "Paul Franklin",
    },
    trivia: [
      "The spinning top used in the film was Christopher Nolan's own personal prop from a previous production.",
      "Leonardo DiCaprio and Nolan discussed the ending for months before agreeing to leave it ambiguous on set.",
      "The hallway fight sequence was filmed practically in a rotating corridor set, not with CGI.",
      "Hans Zimmer's score slows down a sample of Édith Piaf's 'Non, je ne regrette rien' to sync dream-time to real-time.",
    ],
    timeline: [
      { label: "Reality", detail: "Cobb is hired by Saito to perform inception on Robert Fischer." },
      { label: "Dream Level 1", detail: "Rain-soaked city heist introduces the extraction team and the plan." },
      { label: "Dream Level 2", detail: "The hotel level, where zero-gravity fight choreography mirrors the van's fall above." },
      { label: "Dream Level 3", detail: "The snow fortress assault, timed to the van's descent and the kick sequence." },
      { label: "Limbo", detail: "Cobb and Mal's shared subconscious city, built from years of dreaming together." },
    ],
    hiddenDetails: [
      "Cobb's wedding ring appears only when he is dreaming — a visual tell the film never states outright.",
      "The number of kicks needed to wake each dream level doubles, reinforcing the nested time dilation.",
      "Ariadne's name references the mythological figure who helped navigate a labyrinth.",
    ],
    easterEggs: [
      "The chess-like hotel corridor numbers subtly count down as the sequence progresses.",
      "A newspaper glimpsed in the background foreshadows Fischer's father's death.",
    ],
    characterAnalysis: [
      {
        name: "Dom Cobb",
        motivation: "Wants to see his children again and escape his fugitive status by pulling off one last job.",
        arc: "Moves from a man hiding behind his work to one who finally confronts his guilt over Mal.",
        relationships: "His grief over Mal both threatens every job and is the emotional core he must resolve.",
        psychologicalProfile: "Repression and denial manifest literally — Mal is his subconscious given form.",
        symbolicMeaning: "The spinning top represents his need for external validation of what's real.",
      },
      {
        name: "Mal",
        motivation: "As a projection, drives Cobb to stay in his guilt rather than let it go.",
        arc: "Never changes — she's frozen as Cobb's memory of the moment he lost her.",
        relationships: "The inverse of Cobb's love: devotion curdled into sabotage.",
        psychologicalProfile: "Embodies Cobb's unresolved guilt rather than the real woman she was based on.",
        symbolicMeaning: "A warning about how deeply unprocessed grief can distort memory.",
      },
    ],
    endingExplained: {
      breakdown:
        "Cobb returns home, spins the top, and walks away to see his children before it resolves on screen.",
      symbolism:
        "The cut to black mid-spin argues that the emotional truth (reuniting with his kids) matters more than the literal one.",
      whatHappened:
        "Nolan has said the ending is intentionally ambiguous by design, not a puzzle with one hidden answer.",
      alternateInterpretations: [
        "Cobb is still dreaming and has accepted a comfortable illusion over reality.",
        "Cobb is awake, and his indifference to the top shows he no longer needs to check.",
      ],
    },
    cinematography: {
      cameraStyle: "Wally Pfister favors wide, stable compositions that keep dream geography legible.",
      colorPalette: "Cool blues and grays for reality, warmer ambers for constructed dream layers.",
      lighting: "High-contrast lighting distinguishes dream levels from the muted 'real world' scenes.",
      aspectRatio: "2.39:1 anamorphic widescreen.",
      notableShots: ["The folding Paris street", "The zero-gravity hotel corridor fight", "The van's slow-motion fall"],
      visualStorytelling: "Practical effects ground even the most surreal dream physics in tangible weight.",
    },
    soundAndMusic: {
      composer: "Hans Zimmer",
      signatureSoundtrack: '"Time"',
      backgroundScoreStyle: "Slow-building brass and strings that stretch a single motif across the runtime.",
      soundDesign: "The 'BRAAAM' horn stab, derived from a slowed-down Piaf sample, became widely imitated.",
      memorableSongs: ["Time", "Dream Is Collapsing"],
    },
    iconicQuotes: [
      { quote: "We need to go deeper.", character: "Cobb" },
      { quote: "Dreams feel real while we're in them.", character: "Cobb" },
      { quote: "An idea is like a virus. Resilient. Highly contagious.", character: "Cobb" },
    ],
    awards: {
      oscars: ["Best Cinematography", "Best Sound Editing", "Best Sound Mixing", "Best Visual Effects"],
      bafta: ["Best Special Visual Effects", "Best Production Design"],
      cannes: [],
      goldenGlobes: [],
      festivalAwards: [],
      majorNominations: ["Academy Award for Best Picture", "Academy Award for Best Original Screenplay"],
    },
    reception: {
      criticalReviews: "Widely praised for its ambition and technical craft, with some debate over its emotional coldness.",
      audienceResponse: "Became an instant talking-point film, prized for rewarding repeat viewings.",
      boxOffice: "Grossed over $836 million worldwide against a $160 million budget.",
      cultStatus: "Its ending remains one of the most argued-over endings in modern cinema.",
    },
    legacy: {
      culturalImpact: "Popularized layered, puzzle-box narrative structures in mainstream blockbusters.",
      influenceOnLaterFilms: "Cited as an influence on later high-concept sci-fi thrillers exploring subjective reality.",
      internetMemes: "The spinning top and the 'BRAAAM' horn became widely referenced shorthand online.",
      fanTheories: "Extensive theories debate whether the entire film takes place within a dream.",
      sequelsSpinoffs: "None — Nolan has stated he has no plans for a sequel.",
    },
    similarMovieIds: ["interstellar", "the-dark-knight"],
  },
  {
    id: "arrival",
    title: "Arrival",
    year: 2016,
    tagline: "Why are they here?",
    posterUrl: poster("Arrival", "10161f"),
    genres: ["Sci-Fi", "Drama"],
    runtimeMinutes: 116,
    director: "Denis Villeneuve",
    rating: 7.9,
    spoilerFreeSummary:
      "When mysterious spacecraft touch down across the globe, a linguist is recruited to communicate with the visitors before fear pushes the world to war. What she learns about their language changes how she experiences time itself.",
    castAndCrew: {
      mainCast: [
        { actor: "Amy Adams", character: "Dr. Louise Banks" },
        { actor: "Jeremy Renner", character: "Ian Donnelly" },
        { actor: "Forest Whitaker", character: "Colonel Weber" },
      ],
      supportingCast: ["Michael Stuhlbarg", "Tzi Ma", "Mark O'Brien"],
      cinematographer: "Bradford Young",
      musicComposer: "Jóhann Jóhannsson",
      editor: "Joe Walker",
      costumeDesigner: "Renée April",
      vfxSupervisor: "Louis Morin",
    },
    trivia: [
      "The heptapod language was designed by artist Martine Bertrand, who hand-drew each logogram.",
      "Amy Adams learned to write the alien logograms so her on-screen movements looked authentic.",
      "The film's non-linear structure was written into the script from the earliest draft, not added in post.",
    ],
    timeline: [
      { label: "First Contact", detail: "Twelve shells appear worldwide; Louise is recruited by the military." },
      { label: "Translation", detail: "Louise and Ian begin decoding the heptapod's circular logograms." },
      { label: "Fracture", detail: "Nations stop sharing data; China threatens military action." },
      { label: "Understanding", detail: "Louise grasps the language's nonlinear nature, unlocking future memory." },
      { label: "Resolution", detail: "Louise uses a foreseen future call to defuse the global standoff." },
    ],
    hiddenDetails: [
      "Scenes with Louise's 'daughter' are never flagged as future memories — they read as flashbacks on first viewing.",
      "The heptapods' circular logograms have no beginning or end, mirroring their non-linear perception of time.",
    ],
    easterEggs: [
      "A whiteboard equation in Ian's workspace is a real physics formula related to non-zero-sum game theory.",
      "The ship's interior gravity design was inspired by M.C. Escher's impossible staircases.",
    ],
    characterAnalysis: [
      {
        name: "Louise Banks",
        motivation: "Driven by intellectual curiosity, then by the weight of a future she alone can foresee.",
        arc: "Moves from grieving an event she thinks is in her past to choosing a future she knows will end in loss.",
        relationships: "Her bond with Ian is complicated in hindsight by what she doesn't yet tell him.",
        psychologicalProfile: "Carries her non-linear memories with quiet composure rather than dread.",
        symbolicMeaning: "Represents acceptance — choosing joy even knowing its eventual cost.",
      },
    ],
    endingExplained: {
      breakdown: "The scenes with Louise's daughter are revealed to be memories of the future, not the past.",
      symbolism: "Learning the heptapod language rewires Louise's perception of time to be non-linear.",
      whatHappened:
        "Louise uses knowledge from her future to defuse the present crisis, then chooses to have the daughter she knows she'll lose.",
      alternateInterpretations: [
        "Some read the ending as fatalistic; others as a hopeful argument for living fully despite foreknowledge of loss.",
      ],
    },
    cinematography: {
      cameraStyle: "Slow, deliberate camera moves that favor patience over spectacle.",
      colorPalette: "Desaturated grays and greens, evoking overcast unease.",
      lighting: "Soft, diffused light inside the ship contrasts with the misty military camp exteriors.",
      aspectRatio: "1.85:1.",
      notableShots: ["The ship's vertical descent into view", "Louise's hand on the glass barrier"],
      visualStorytelling: "The circular logograms visually echo the film's own non-linear editing structure.",
    },
    soundAndMusic: {
      composer: "Jóhann Jóhannsson",
      signatureSoundtrack: '"On the Nature of Daylight" (Max Richter, used in the finale)',
      backgroundScoreStyle: "Low, dissonant drones built from processed human voice.",
      soundDesign: "The heptapods' vocalizations were designed to feel organic rather than mechanical.",
      memorableSongs: ["On the Nature of Daylight"],
    },
    iconicQuotes: [
      { quote: "Now I remember how it ends.", character: "Louise Banks" },
      { quote: "If you could see your whole life laid out in front of you, would you change things?", character: "Louise Banks" },
    ],
    awards: {
      oscars: ["Best Sound Editing"],
      bafta: [],
      cannes: [],
      goldenGlobes: [],
      festivalAwards: [],
      majorNominations: ["Academy Award for Best Picture", "Academy Award for Best Director"],
    },
    reception: {
      criticalReviews: "Praised as a rare big-budget sci-fi film centered on empathy and language rather than combat.",
      audienceResponse: "Resonated especially on repeat viewing, once the twist recontextualizes earlier scenes.",
      boxOffice: "Grossed around $203 million worldwide against a $47 million budget.",
      cultStatus: "Frequently cited as one of the best sci-fi films of its decade.",
    },
    legacy: {
      culturalImpact: "Renewed mainstream interest in linguistics-driven science fiction.",
      influenceOnLaterFilms: "Influenced subsequent films favoring emotional, cerebral sci-fi over spectacle.",
      internetMemes: "The heptapod logograms became a recognizable visual shorthand for the film.",
      fanTheories: "Ongoing discussion over whether the events are predetermined or freely chosen.",
      sequelsSpinoffs: "None currently planned.",
    },
    similarMovieIds: ["interstellar", "inception"],
  },
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    year: 2008,
    tagline: "Why so serious?",
    posterUrl: poster("The Dark Knight", "1a1210"),
    genres: ["Action", "Crime", "Drama"],
    runtimeMinutes: 152,
    director: "Christopher Nolan",
    rating: 9.0,
    spoilerFreeSummary:
      "As Batman, Gordon, and Harvey Dent take on Gotham's organized crime, a chaotic new criminal known as the Joker emerges to test how far each of them will go to hold the line between order and anarchy.",
    castAndCrew: {
      mainCast: [
        { actor: "Christian Bale", character: "Bruce Wayne / Batman" },
        { actor: "Heath Ledger", character: "The Joker" },
        { actor: "Aaron Eckhart", character: "Harvey Dent" },
        { actor: "Gary Oldman", character: "James Gordon" },
      ],
      supportingCast: ["Maggie Gyllenhaal", "Michael Caine", "Morgan Freeman"],
      cinematographer: "Wally Pfister",
      musicComposer: "Hans Zimmer & James Newton Howard",
      editor: "Lee Smith",
      costumeDesigner: "Lindy Hemming",
      vfxSupervisor: "Chris Corbould",
    },
    trivia: [
      "Heath Ledger stayed alone in a hotel room for weeks to develop the Joker's voice and posture.",
      "The Joker has no defined origin in the film — his two conflicting scar stories are intentional.",
      "IMAX cameras were used for major set pieces, an unusual choice for a studio film at the time.",
    ],
    timeline: [
      { label: "Escalation", detail: "The Joker robs a mob bank and offers Gotham's crime bosses his services." },
      { label: "Manhunt", detail: "Batman, Gordon, and Dent pursue the Joker across Gotham and Hong Kong." },
      { label: "The Ferries", detail: "The Joker forces two ferries into a mutual-destruction social experiment." },
      { label: "Harvey's Fall", detail: "Dent's disfigurement and grief turn him into Two-Face." },
      { label: "The Lie", detail: "Batman takes the blame for Dent's crimes to protect Gotham's hope." },
    ],
    hiddenDetails: [
      "The Joker's makeup grows more cracked and worn as the film progresses, tracking his unraveling.",
      "Two-Face's coin has two 'good' sides until the moment fate turns against Harvey.",
    ],
    easterEggs: [
      "A brief shot of a playing card during the bank heist hints at the Joker's calling card motif from the comics.",
      "The Joker's pencil trick was performed practically by Heath Ledger in a single take.",
    ],
    characterAnalysis: [
      {
        name: "The Joker",
        motivation: "Has no fixed goal beyond proving that civilized order is a fragile illusion.",
        arc: "Deliberately static — he ends the film unchanged, having only revealed others' breaking points.",
        relationships: "Positions himself as Batman's dark mirror, testing him rather than opposing him for gain.",
        psychologicalProfile: "Presents as an agent of pure chaos, with even his own backstory left deliberately false.",
        symbolicMeaning: "Embodies anarchy as a philosophy rather than a personality.",
      },
      {
        name: "Harvey Dent",
        motivation: "Believes in incorruptible justice and Gotham's ability to reform through the law.",
        arc: "Falls from Gotham's 'white knight' to the vengeful Two-Face after personal tragedy.",
        relationships: "His engagement to Rachel and rivalry-turned-alliance with Batman drive his fall.",
        psychologicalProfile: "His coin-flip philosophy foreshadows the randomness that eventually breaks him.",
        symbolicMeaning: "Represents how easily idealism curdles into nihilism under enough pressure.",
      },
    ],
    endingExplained: {
      breakdown: "Batman takes the blame for Dent's crimes so Gotham can keep believing in its 'white knight'.",
      symbolism: "The false narrative Batman accepts shows that some lies can serve a greater good.",
      whatHappened: "Two-Face dies, Batman convinces Gordon to pin the murders on him, and becomes a fugitive by choice.",
      alternateInterpretations: [
        "Some see the ending as a troubling endorsement of noble lies; others as tragic self-sacrifice.",
      ],
    },
    cinematography: {
      cameraStyle: "Large-format IMAX photography for major set pieces, a first for a studio feature.",
      colorPalette: "Cool blues and grays for Gotham, punctuated by the Joker's garish purples and greens.",
      lighting: "High-contrast, shadow-heavy lighting reinforces the film's moral ambiguity.",
      aspectRatio: "Alternates between 2.39:1 and IMAX's taller 1.44:1 for select sequences.",
      notableShots: ["The Joker's hospital walk", "The truck flip", "The ferry standoff"],
      visualStorytelling: "Practical stunts and real IMAX scale ground the film's more operatic moments.",
    },
    soundAndMusic: {
      composer: "Hans Zimmer and James Newton Howard",
      signatureSoundtrack: '"Why So Serious?"',
      backgroundScoreStyle: "A single sustained, dissonant string tone underscores the Joker's scenes.",
      soundDesign: "The Joker's theme famously has almost no melody, just tension-building texture.",
      memorableSongs: ["Why So Serious?", "A Dark Knight"],
    },
    iconicQuotes: [
      { quote: "Why so serious?", character: "The Joker" },
      { quote: "You either die a hero, or you live long enough to see yourself become the villain.", character: "Harvey Dent" },
      { quote: "It's not about money. It's about sending a message.", character: "The Joker" },
    ],
    awards: {
      oscars: ["Best Supporting Actor (Heath Ledger, posthumous)", "Best Sound Editing"],
      bafta: ["Best Supporting Actor (Heath Ledger)"],
      cannes: [],
      goldenGlobes: ["Best Supporting Actor (Heath Ledger)"],
      festivalAwards: [],
      majorNominations: ["Academy Award for Best Sound Mixing", "Academy Award for Best Film Editing"],
    },
    reception: {
      criticalReviews: "Widely hailed as redefining what a superhero film could be, anchored by Ledger's performance.",
      audienceResponse: "One of the most rewatched films of its era; Ledger's death shortly before release intensified attention.",
      boxOffice: "Grossed over $1 billion worldwide, a landmark for the genre at the time.",
      cultStatus: "Regularly cited among the greatest films of the 2000s, genre aside.",
    },
    legacy: {
      culturalImpact: "Pushed studios toward darker, more morally complex takes on comic-book material.",
      influenceOnLaterFilms: "Its grounded, crime-thriller tone influenced a wave of subsequent superhero films.",
      internetMemes: "The Joker's 'why so serious?' and pencil trick remain widely referenced online.",
      fanTheories: "Ongoing debate over whether the Joker's two scar stories hint at a 'true' backstory.",
      sequelsSpinoffs: "Followed by The Dark Knight Rises (2012), concluding Nolan's trilogy.",
    },
    similarMovieIds: ["inception"],
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    posterUrl: poster("Interstellar", "10141c"),
    genres: ["Sci-Fi", "Drama", "Adventure"],
    runtimeMinutes: 169,
    director: "Christopher Nolan",
    rating: 8.7,
    spoilerFreeSummary:
      "As Earth's soil fails and dust storms close in, a former pilot leaves his children behind to search the stars for a new home for humanity — and finds that love, time, and gravity may be more connected than science admits.",
    castAndCrew: {
      mainCast: [
        { actor: "Matthew McConaughey", character: "Cooper" },
        { actor: "Anne Hathaway", character: "Amelia Brand" },
        { actor: "Jessica Chastain", character: "Murph (adult)" },
        { actor: "Michael Caine", character: "Professor Brand" },
      ],
      supportingCast: ["Mackenzie Foy", "Casey Affleck", "Bill Irwin (voice of TARS)"],
      cinematographer: "Hoyte van Hoytema",
      musicComposer: "Hans Zimmer",
      editor: "Lee Smith",
      costumeDesigner: "Mary Zophres",
      vfxSupervisor: "Paul Franklin",
    },
    trivia: [
      "Kip Thorne's black hole equations were used to render Gargantua, producing a physically accurate image.",
      "The corn fields were real crops planted specifically for the production, not visual effects.",
      "Hans Zimmer wrote the score before seeing a single frame, based only on a one-page story Nolan gave him.",
    ],
    timeline: [
      { label: "Dust Bowl Earth", detail: "Cooper discovers NASA's secret base and is recruited for the Lazarus missions." },
      { label: "Miller's Planet", detail: "One hour there costs seven years back home due to time dilation near Gargantua." },
      { label: "Mann's Planet", detail: "Dr. Mann's deception nearly costs the crew the mission and their lives." },
      { label: "Tesseract", detail: "Cooper falls into Gargantua and finds himself inside a five-dimensional tesseract." },
      { label: "Reunion", detail: "An elderly Murph reunites briefly with a young Cooper aboard Cooper Station." },
    ],
    hiddenDetails: [
      "The bookshelf 'ghost' Murph investigates as a child is revealed to be Cooper communicating from the future.",
      "TARS's humor settings are dialed down during the most dangerous sequences, tracking the crew's rising tension.",
    ],
    easterEggs: [
      "Murph's name is a reference to Murphy's Law, which her father reframes as a hopeful rather than pessimistic idea.",
      "The robot TARS's blocky design was a deliberate rejection of humanoid sci-fi robots.",
    ],
    characterAnalysis: [
      {
        name: "Cooper",
        motivation: "Torn between duty to humanity's survival and his promise to return to his children.",
        arc: "Goes from a grounded engineer-turned-farmer to humanity's reluctant explorer of the unknown.",
        relationships: "His bond with Murph, strained by years of time dilation, anchors the entire mission.",
        psychologicalProfile: "Driven by guilt over leaving, which resurfaces powerfully in the tesseract.",
        symbolicMeaning: "Represents parental love as a force that transcends even physics.",
      },
      {
        name: "Murph",
        motivation: "Resents her father's absence, then dedicates her life to the equation he inspired.",
        arc: "Moves from an angry child to the scientist who ultimately solves gravity's equation.",
        relationships: "Her strained relationship with Cooper resolves only in the film's final act.",
        psychologicalProfile: "Channels abandonment into obsessive scientific pursuit.",
        symbolicMeaning: "Embodies hope maintained across decades of apparent silence.",
      },
    ],
    endingExplained: {
      breakdown: "Cooper falls into Gargantua and ends up inside a tesseract built by future humans to send data through time.",
      symbolism: "The bookshelf functions as a bridge between generations, built from love rather than technology alone.",
      whatHappened:
        "Cooper transmits the quantum data Murph needs to solve gravity, saving humanity, then wakes up decades later near Saturn.",
      alternateInterpretations: [
        "Some read the tesseract as literal five-dimensional science; others as a metaphor for how memory transcends time.",
      ],
    },
    cinematography: {
      cameraStyle: "Hoyte van Hoytema shot extensively on 65mm and IMAX film for scale and clarity.",
      colorPalette: "Dusty ambers on Earth, stark whites and blacks in space and on ice.",
      lighting: "Natural, practical lighting was prioritized over artificial rigs wherever possible.",
      aspectRatio: "Alternates between 2.39:1 and IMAX's 1.43:1.",
      notableShots: ["The docking sequence with the Endurance", "Miller's planet's giant waves", "The tesseract library"],
      visualStorytelling: "Real crop fields and physically accurate black hole rendering ground the film's scale.",
    },
    soundAndMusic: {
      composer: "Hans Zimmer",
      signatureSoundtrack: '"Cornfield Chase"',
      backgroundScoreStyle: "A church organ anchors much of the score, giving it a vast, reverent quality.",
      soundDesign: "Zimmer wrote the score before seeing footage, working only from a one-page story summary.",
      memorableSongs: ["Cornfield Chase", "No Time for Caution", "Mountains"],
    },
    iconicQuotes: [
      { quote: "Love is the one thing we're capable of perceiving that transcends time and space.", character: "Amelia Brand" },
      { quote: "We used to look up at the sky and wonder at our place in the stars.", character: "Cooper" },
    ],
    awards: {
      oscars: ["Best Visual Effects"],
      bafta: ["Best Special Visual Effects"],
      cannes: [],
      goldenGlobes: [],
      festivalAwards: [],
      majorNominations: ["Academy Award for Best Original Score", "Academy Award for Best Sound Editing"],
    },
    reception: {
      criticalReviews: "Praised for its ambition and emotional weight, with some critics noting its dense exposition.",
      audienceResponse: "Became a favorite for its blend of hard science and family drama.",
      boxOffice: "Grossed over $701 million worldwide against a $165 million budget.",
      cultStatus: "Its physically accurate black hole visualization was later used in actual astrophysics research.",
    },
    legacy: {
      culturalImpact: "Renewed public fascination with black holes and relativistic time dilation.",
      influenceOnLaterFilms: "Its black hole rendering techniques informed subsequent scientific visualizations.",
      internetMemes: '"Murph" and the tesseract scene are frequently referenced in sci-fi discussions.',
      fanTheories: "Debate continues over the exact mechanics of Cooper's message through the bookshelf.",
      sequelsSpinoffs: "None — conceived and remains a standalone film.",
    },
    similarMovieIds: ["inception", "arrival"],
  },
];

function toSummary(m: SeedMovieRaw): MovieSummary {
  return { id: m.id, title: m.title, year: m.year, posterUrl: m.posterUrl, tagline: m.tagline, rating: m.rating };
}

export const seedMovies: MovieDetails[] = rawSeedMovies.map(({ similarMovieIds, ...rest }) => ({
  ...rest,
  similarMovies: similarMovieIds
    .map((sid) => rawSeedMovies.find((r) => r.id === sid))
    .filter((x): x is SeedMovieRaw => !!x)
    .map(toSummary),
}));

export const findSeedMovie = (id: string) => seedMovies.find((m) => m.id === id);

export const searchSeedMovies = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return seedMovies.filter((m) => m.title.toLowerCase().includes(q));
};
