# Question bank spec (read fully before writing)

Output: ONE JSON file at the path given in your task. Build it with a Python script (json.dump) so it is guaranteed valid. Do not hand-type JSON.

Top level:
{
  "subtest": "AR",                 // the 2-letter code
  "name": "Arithmetic Reasoning",
  "items": [ ... exactly 40 items ... ]
}

Each item:
{
  "id": "AR-01",                   // code + 2-digit index, 01..40
  "difficulty": "easy" | "medium" | "hard",   // target 12 easy, 16 medium, 12 hard
  "topic": "percents",             // short tag from the official content outline
  "passage": null,                 // Paragraph Comprehension only: the passage text (60-140 words). null elsewhere.
  "stem": "question text",
  "choices": ["...", "...", "...", "..."],   // exactly 4, all distinct, similar length and style
  "answer": 2,                     // 0-based index of the correct choice
  "explanation": "1 to 3 sentences that teach: show the work or state the fact and why the others are wrong.",
  "svg": null                      // Mechanical Comprehension and Assembling Objects only, see below. null elsewhere.
}

Rules:
- ORIGINAL items only. Never copy or lightly paraphrase official ASVAB sample questions or any published book's items. Use the official sample pages only to match format, difficulty and topic coverage.
- Match the real CAT-ASVAB: four-option multiple choice, high-school level, one unambiguous correct answer. Distractors should be the answers a student gets from common mistakes, not random.
- Spread items across every topic in the official content outline for your subtest (see the research notes you are told to read). Tag each with "topic".
- Difficulty: "easy" = one step or direct recall; "medium" = two steps or applied understanding; "hard" = multi-step, unfamiliar context, or fine distinction.
- Verify every answer. For math, compute it in your Python script and assert the stored answer matches. For facts, double-check against a reliable reference. Re-read every item once more for a second correct option or a trick of wording.
- Style: plain American English, no em-dashes or en-dashes (use commas and periods), no emojis, no Unicode math symbols (write "x" for times, "/" for division, "^" or "squared" for powers, "sqrt" for square root, "degrees" for degrees). Numbers with units written out ("12 feet", "$4.50", "3.5 hours"). ASCII only.
- No calculator is allowed on the real test, so numbers must be workable by hand.
- Write explanations a 17-year-old can learn from.

SVG rules (MC and AO only):
- Each SVG is a complete <svg> element string with a viewBox (e.g. viewBox="0 0 320 180"), no width/height attributes, no external references, no <script>, no <style>, no fonts beyond the default.
- Use stroke="currentColor" and fill="none" for outlines, fill="currentColor" for solid parts and text, and fill-opacity="0.15" for shaded areas, so the drawing works on light and dark backgrounds. Do not hard-code colors.
- Keep each SVG under 3000 characters. Label parts with letters (A, B, C) in <text> elements, font-size 12-14.
- GENERATE SVGs WITH CODE, not by hand: write Python helper functions (lever(), pulley(), gear(), shape(), rotate(), mirror()) and compose the drawing from them so geometry is correct and the correct answer is provably correct.
- For Assembling Objects, the item's single "svg" must contain the reference figure on the left and four option boxes labeled A, B, C, D in a row (or 2x2 on narrow widths is NOT needed; one row, viewBox about 0 0 640 170). The "choices" array is then ["A","B","C","D"] and "answer" is the index of the correct box. Distractors must be wrong for a real reason: mirror image instead of rotation, a piece swapped for a similar one, pieces attached at the wrong lettered points, or an extra or missing piece.
