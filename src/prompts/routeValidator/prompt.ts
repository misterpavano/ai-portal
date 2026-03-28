/**
 * Task-specific prompt snippets for Route Validator
 * These prompts are added to the system message when the corresponding task checkbox is checked
 */

export const SPELL_CHECK_TASK_PROMPT = `TASK: Spell check

When this task is active:

- Scan all visible text for spelling errors, including headings, body text, buttons, labels, and captions.

- Treat:
  - Wrongly spelled words,
  - Incorrect capitalization when clearly unintended (e.g. "teh" instead of "The"),
  - Obvious typos in brand or product names (unless clearly stylized) 
  as SPELLING issues.

For each spelling issue, create one JSON object with:
- task: "spell_check"
- shortLabel: "Misspelled word" or "Spelling error"
- description: briefly explain why it is incorrect.
- originalText: the text that contains the error.
- suggestedFix: the corrected text.
- coordinates: approximate bounding box around the word or phrase.
- coordinateSystem: "normalized_0_1".`;

export const GRAMMAR_CONSISTENCY_TASK_PROMPT = `TASK: Grammar consistency

When this task is active:

- Check all text for:
  - Subject–verb agreement (e.g. "he have" → "he has"),
  - Sentence structure issues (fragments, run-on sentences),
  - Incorrect tense usage when it breaks clarity,
  - Misuse of articles ("a", "an", "the"),
  - Pronoun errors and unclear references,
  - Punctuation errors that change meaning (missing full stops, commas, etc.),
  - Inconsistent style within the same context (e.g. switching between first and third person without reason).

Only flag issues that clearly reduce clarity or professionalism.

For each grammar issue, create one JSON object with:
- task: "grammar_consistency"
- shortLabel: e.g. "Grammar error", "Tense inconsistency", or "Punctuation issue"
- description: briefly explain the problem in plain language.
- originalText: the problematic sentence or phrase.
- suggestedFix: a corrected or improved version of the sentence/phrase.
- coordinates: approximate bounding box of the sentence/phrase.
- coordinateSystem: "normalized_0_1".`;

export const WCAG_COMPLIANCE_TASK_PROMPT = `TASK: WCAG compliance

When this task is active:

- Evaluate the document or image roughly against common WCAG principles (focus on what you can infer visually and from text):

  1) Text contrast
     - Flag low-contrast text (e.g. light grey text on white, or text over busy images) that appears hard to read.

  2) Text size & readability
     - Flag very small or overly condensed text that is likely difficult to read.
     - Flag text that uses excessive ALL CAPS when it hurts readability.

  3) Structure & headings
     - Flag if headings hierarchy is visually unclear (e.g. all headings look identical and don't show structure).
     - Flag long, dense paragraphs with no breaks that may be hard to read.

  4) Links & buttons
     - Flag links or call-to-action buttons that are not visually distinct from surrounding text.
     - Flag non-descriptive link text (e.g. "click here") when surrounding context is not clear.

  5) Images & icons with text meaning
     - When an image or icon clearly conveys essential meaning (e.g. a button icon, warning symbol, or infographic text), note if there is no visible accompanying text or label that explains it.

For each WCAG-related issue, create one JSON object with:
- task: "wcag_compliance"
- shortLabel: e.g. "Low contrast text", "Unreadable small text", "Unclear heading hierarchy", "Non-descriptive link"
- description: explain which WCAG-related principle is affected and why.
- originalText: the relevant text (if any).
- suggestedFix: concrete improvement (e.g. "Increase contrast between text and background", "Use larger font size", "Change link text to describe destination").
- coordinates: approximate bounding box of the problematic element/area.
- coordinateSystem: "normalized_0_1".`;

export const SEO_CHECKS_TASK_PROMPT = `TASK: SEO checks

When this task is active:

- Assume the document/page may be used on the web and review for basic on-page SEO elements that can be inferred from the content:

  1) Titles & headings
     - Flag missing or weak main heading (H1-equivalent) when there is content but no clear main title.
     - Flag very generic titles that do not describe the page content.

  2) Keyword presence & relevance
     - Based on the repeated topic of the content, infer likely key phrases.
     - Flag if the main topic is not clearly present in headings or early in the content.

  3) Meta-style information (as visible)
     - If there is a tagline or meta-description-like text (e.g. under main title), flag if it is vague or not descriptive.

  4) Links & calls to action
     - Flag non-descriptive link/CTA text (e.g. "Read more", "Click here") without contextual keywords.

  5) Image-related SEO (as visible)
     - When an image clearly illustrates something important but is not accompanied by any descriptive caption or nearby text, flag that as a missing descriptive text issue.

For each SEO issue, create one JSON object with:
- task: "seo_checks"
- shortLabel: e.g. "Weak page title", "Missing descriptive heading", "Generic CTA text"
- description: explain how this may hurt SEO clarity or relevance.
- originalText: the related headline, CTA, or snippet.
- suggestedFix: a clearer, keyword-rich alternative (without stuffing).
- coordinates: approximate bounding box of the relevant area.
- coordinateSystem: "normalized_0_1".`;

export const ORG_EDITORIAL_GUIDELINE_TASK_PROMPT = `TASK: Organization editorial guideline

When this task is active:

- You will be given the organization's editorial guideline text as part of the conversation (e.g. brand voice, allowed terms, capitalization rules, spelling variant preference like US vs UK English, tone guidelines, etc.).

- Treat that guideline as the source of truth.

Check the content against the guideline for:
  - Disallowed or discouraged words/phrases,
  - Required terminology not being used where appropriate,
  - Wrong spelling variant (e.g. using US spelling when guideline says UK),
  - Tone/style violations (e.g. guideline says "friendly and informal" but text is too formal, or vice versa),
  - Incorrect capitalization or formatting of product names, brand names, or feature names,
  - Inconsistent date/number formats when the guideline specifies one.

For each violation, create one JSON object with:
- task: "org_editorial_guideline"
- shortLabel: e.g. "Brand term misuse", "Tone inconsistency", "Wrong spelling variant"
- description: explain how it conflicts with the guideline (quote the relevant rule in your own words).
- originalText: the problematic phrase/sentence.
- suggestedFix: a corrected version that follows the guideline.
- coordinates: approximate bounding box of the problematic text.
- coordinateSystem: "normalized_0_1".`;

/**
 * Map task names from TasksStep to their corresponding prompt constants
 * Note: "Client brand guideline" uses the same structure as "Organization editorial guideline"
 * but may have different guideline content provided by the user
 */
export const TASK_PROMPT_MAP: Record<string, string> = {
  "Spell check": SPELL_CHECK_TASK_PROMPT,
  "Grammar consistency": GRAMMAR_CONSISTENCY_TASK_PROMPT,
  "WCAG compliance": WCAG_COMPLIANCE_TASK_PROMPT,
  "SEO checks": SEO_CHECKS_TASK_PROMPT,
  "Organization editorial guideline": ORG_EDITORIAL_GUIDELINE_TASK_PROMPT,
  "Client brand guideline": ORG_EDITORIAL_GUIDELINE_TASK_PROMPT, // Uses same prompt structure, but guideline content will be different
};

/**
 * Get task prompts for selected tasks
 * @param selectedTasks Array of task names from TasksStep
 * @returns Array of prompt strings for the selected tasks
 */
export const getTaskPrompts = (selectedTasks: string[]): string[] => {
  return selectedTasks
    .map((task) => TASK_PROMPT_MAP[task])
    .filter((prompt) => prompt !== undefined);
};
