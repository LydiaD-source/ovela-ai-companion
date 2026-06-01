/**
 * Convert visual/written text into something natural to hear.
 * Used right before sending text to TTS or D-ID so Isabella sounds human,
 * not like a screen reader.
 *
 * Rules:
 *  - Expand units: g -> grams, ml -> milliliters, L -> liters, kg -> kilograms,
 *    cm -> centimeters, kcal -> calories, % -> percent, /day -> per day, etc.
 *  - Strip markdown glyphs (* _ ` # >) and bullets.
 *  - Remove fenced code/JSON blocks (defensive — the chat already strips
 *    `assessment-report`, but other blocks shouldn't be read aloud).
 *  - Collapse stray punctuation runs and excess whitespace.
 *  - Keep commas/periods as natural prosody cues (TTS handles those).
 */

export function humanizeForSpeech(input: string): string {
  if (!input) return '';
  let s = input;

  // Strip fenced code blocks entirely
  s = s.replace(/```[\s\S]*?```/g, ' ');
  // Strip inline code ticks
  s = s.replace(/`+/g, '');
  // Strip markdown emphasis/headers/blockquote markers
  s = s.replace(/[*_>#]+/g, ' ');
  // Bullet glyphs at line start
  s = s.replace(/^[\s]*[•·\-–—]\s+/gm, '');

  // Unit expansions — match a number (or range) followed by the unit token.
  // Order matters: longer units first.
  const numberLike = /(\d+(?:[.,]\d+)?(?:\s*[-–—to]+\s*\d+(?:[.,]\d+)?)?)/i;
  const unitMap: Array<[RegExp, string]> = [
    [/(\d+(?:[.,]\d+)?)\s?kcal\b/gi, '$1 calories'],
    [/(\d+(?:[.,]\d+)?)\s?cal\b/gi, '$1 calories'],
    [/(\d+(?:[.,]\d+)?)\s?kg\b/gi, '$1 kilograms'],
    [/(\d+(?:[.,]\d+)?)\s?mg\b/gi, '$1 milligrams'],
    [/(\d+(?:[.,]\d+)?)\s?mcg\b/gi, '$1 micrograms'],
    [/(\d+(?:[.,]\d+)?)\s?µg\b/gi, '$1 micrograms'],
    [/(\d+(?:[.,]\d+)?)\s?ml\b/gi, '$1 milliliters'],
    [/(\d+(?:[.,]\d+)?)\s?cl\b/gi, '$1 centiliters'],
    [/(\d+(?:[.,]\d+)?)\s?dl\b/gi, '$1 deciliters'],
    [/(\d+(?:[.,]\d+)?)\s?cm\b/gi, '$1 centimeters'],
    [/(\d+(?:[.,]\d+)?)\s?mm\b/gi, '$1 millimeters'],
    [/(\d+(?:[.,]\d+)?)\s?km\b/gi, '$1 kilometers'],
    [/(\d+(?:[.,]\d+)?)\s?hrs?\b/gi, '$1 hours'],
    [/(\d+(?:[.,]\d+)?)\s?mins?\b/gi, '$1 minutes'],
    [/(\d+(?:[.,]\d+)?)\s?secs?\b/gi, '$1 seconds'],
    [/(\d+(?:[.,]\d+)?)\s?L\b/g,   '$1 liters'],
    [/(\d+(?:[.,]\d+)?)\s?g\b/g,   '$1 grams'],
    [/(\d+(?:[.,]\d+)?)\s?%/g,     '$1 percent'],
    [/(\d+(?:[.,]\d+)?)\s?€/g,     '$1 euros'],
    [/€\s?(\d+(?:[.,]\d+)?)/g,     '$1 euros'],
    [/(\d+(?:[.,]\d+)?)\s?\$/g,    '$1 dollars'],
    [/\$\s?(\d+(?:[.,]\d+)?)/g,    '$1 dollars'],
  ];
  for (const [re, repl] of unitMap) s = s.replace(re, repl);

  // "per day", "per week", etc.
  s = s.replace(/\/\s?day\b/gi, ' per day');
  s = s.replace(/\/\s?week\b/gi, ' per week');
  s = s.replace(/\/\s?month\b/gi, ' per month');
  s = s.replace(/\/\s?year\b/gi, ' per year');
  s = s.replace(/\bper\s+day\b/gi, 'per day');

  // Remove leftover slashes between words ("PDF/screenshot" -> "PDF or screenshot")
  s = s.replace(/(\w)\s?\/\s?(\w)/g, '$1 or $2');

  // Parentheses to commas (TTS reads "(" as nothing useful)
  s = s.replace(/\s*\(\s*/g, ', ').replace(/\s*\)\s*/g, ', ');

  // Em/en dashes → commas (avoid robotic "dash")
  s = s.replace(/\s+[–—]\s+/g, ', ');

  // Remove digit grouping commas inside numbers (1,800 -> 1800) so TTS says "one thousand eight hundred"
  s = s.replace(/(\d),(\d{3})(?!\d)/g, '$1$2');

  // Collapse runs of punctuation and whitespace
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\s*,\s*,+/g, ', ');
  s = s.replace(/\s+([,.!?])/g, '$1');
  s = s.replace(/\n{2,}/g, '\n');

  return s.trim();
}
