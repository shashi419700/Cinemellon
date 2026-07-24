const NICHE_GREETINGS = [
  "Hi, Mr. Anderson.",
  "Hello there.",
  "Say hello to my little friend.",
  "Here's looking at you.",
  "I'll be back.",
  "Why so serious?",
  "May the odds be ever in your favor.",
  "Houston, we have a greeting.",
  "You had me at hello.",
  "Life finds a way.",
];

export function getRandomGreeting(): string {
  return NICHE_GREETINGS[Math.floor(Math.random() * NICHE_GREETINGS.length)];
}
