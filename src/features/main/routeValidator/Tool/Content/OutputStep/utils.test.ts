/**
 * Tests for Route Validator OutputStep utils: highlighting, key terms, range validation.
 * Verifies behavior with all Word document cases (quotes, abbreviations, multi-occurrence).
 */
import {
  extractKeyTermsFromIssue,
  findBestOccurrenceWithKeyTerms,
  shrinkRangeToContainKeyTerm,
  findTextInDocument,
  findTextInDocumentFrom,
  findTextInDocumentForIssue,
  findTextInDocumentForIssueFrom,
  validateWordRange,
  RANGE_MAX_LENGTH,
  SEARCH_TEXT_MAX_DOC_RATIO,
  extractSearchTextFromIssue,
  extractQuotedPhraseFromRecommendation,
  normalizeText,
  tokenizeText,
} from "./utils";

describe("Route Validator OutputStep utils", () => {
  describe("extractKeyTermsFromIssue", () => {
    it("extracts single-quoted terms (straight quotes)", () => {
      const issue = { issue: "Abbreviation 'RCC' not defined", recommendation: "Define 'RCC' at first use." };
      expect(extractKeyTermsFromIssue(issue)).toContain("RCC");
    });

    it("extracts from abbreviation/term/acronym patterns", () => {
      const issue = { issue: "The abbreviation 'AMA' should be spelled out.", reasoning: "term 'WCAG' used." };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms).toContain("AMA");
      expect(terms).toContain("WCAG");
    });

    it("extracts double-quoted terms", () => {
      const issue = { recommendation: 'Change "Follow-Up" to "Follow-up".' };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms.some((t) => t.includes("Follow-Up") || t.includes("Follow-up"))).toBe(true);
    });

    it("ignores too short or too long quoted strings", () => {
      const issue = { issue: "'A' and 'very long phrase that exceeds max key term length' here." };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms).not.toContain("A");
      expect(terms.filter((t) => t.length > 25)).toHaveLength(0);
    });

    it("returns unique terms", () => {
      const issue = { issue: "'RCC' is used. Define 'RCC' first." };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms.filter((t) => t === "RCC")).toHaveLength(1);
    });

    it("extracts heading-quoted phrases (e.g. 7 Topics)", () => {
      const issue = {
        reasoning: "The heading '7 Topics:' begins with a numeral.",
        recommendation: "Change '7 Topics:' to 'Seven Topics:'.",
      };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms.some((t) => t.includes("7 Topics") || t === "7 Topics:")).toBe(true);
    });
  });

  describe("extractQuotedPhraseFromRecommendation", () => {
    it("extracts phrase from Change 'X' to 'Y' pattern", () => {
      const rec = "Change '7 Topics:' to 'Seven Topics:'.";
      expect(extractQuotedPhraseFromRecommendation({ recommendation: rec })).toContain("7 Topics:");
    });

    it("extracts from heading 'X' pattern", () => {
      const rec = "The heading '7 Topics:' begins with a numeral.";
      const phrases = extractQuotedPhraseFromRecommendation({ recommendation: rec });
      expect(phrases.some((p) => p.includes("7 Topics"))).toBe(true);
    });

    it("extracts Treatment Landscape from recommendation so we never highlight only Landscape", () => {
      const rec = "Change 'Treatment Landscape' to 'Treatment landscape'.";
      const phrases = extractQuotedPhraseFromRecommendation({ recommendation: rec });
      expect(phrases).toContain("Treatment Landscape");
      expect(phrases).toContain("Treatment landscape");
    });
  });

  describe("findBestOccurrenceWithKeyTerms", () => {
    it("returns same range when it already contains key term", () => {
      const doc = "First-Line advanced RCC (aRCC) Treatment Considerations.";
      const range = { start: 16, end: 42 };
      const result = findBestOccurrenceWithKeyTerms(doc, "advanced RCC (aRCC)", ["RCC"], range);
      expect(result).toEqual(range);
    });

    it("picks occurrence that contains key term over first occurrence", () => {
      const doc = "Follow-Up and other text. First-Line advanced RCC (aRCC) Treatment.";
      const searchText = "Treatment";
      const firstIdx = doc.toLowerCase().indexOf(searchText.toLowerCase());
      const range = { start: firstIdx, end: firstIdx + searchText.length };
      const result = findBestOccurrenceWithKeyTerms(doc, searchText, ["RCC"], range);
      expect(result.start).toBeGreaterThanOrEqual(40);
      expect(doc.substring(result.start, result.end).toLowerCase()).toBe("treatment");
      expect(doc.substring(result.start - 20, result.end + 5).toLowerCase()).toContain("rcc");
    });

    it("returns first occurrence when no occurrence contains key term", () => {
      const doc = "Word here. Word again.";
      const range = { start: 0, end: 4 };
      const result = findBestOccurrenceWithKeyTerms(doc, "Word", ["XYZ"], range);
      expect(result.start).toBe(0);
      expect(result.end).toBe(4);
    });

    it("returns range unchanged when key terms array is empty", () => {
      const range = { start: 10, end: 20 };
      expect(findBestOccurrenceWithKeyTerms("doc", "text", [], range)).toEqual(range);
    });
  });

  describe("shrinkRangeToContainKeyTerm", () => {
    it("shrinks to minimal span containing key term", () => {
      const doc = "First-Line advanced RCC (aRCC) Treatment Considerations.";
      const range = { start: 0, end: 52 };
      const result = shrinkRangeToContainKeyTerm(doc, range, ["RCC"]);
      expect(result.start).toBeGreaterThanOrEqual(0);
      expect(result.end).toBeLessThanOrEqual(52);
      expect(doc.substring(result.start, result.end).toLowerCase()).toContain("rcc");
    });

    it("returns original range when key terms empty", () => {
      const range = { start: 5, end: 15 };
      expect(shrinkRangeToContainKeyTerm("hello world", range, [])).toEqual(range);
    });

    it("returns original range when no key term in range", () => {
      const doc = "No abbreviation here.";
      const range = { start: 0, end: 10 };
      expect(shrinkRangeToContainKeyTerm(doc, range, ["RCC"])).toEqual(range);
    });

    it("keeps full phrase Quality of life, does not shrink to single word", () => {
      const doc = "Topics: Quality of life, and others.";
      const range = { start: 8, end: 23 };
      const result = shrinkRangeToContainKeyTerm(doc, range, ["life", "Quality of life"]);
      expect(result.start).toBe(8);
      expect(result.end).toBe(23);
      expect(doc.substring(result.start, result.end)).toBe("Quality of life");
    });

    it("does not shrink to single word Landscape", () => {
      const doc = "Non clear cell RCC (nccRCC) Treatment Landscape.";
      const fullPhrase = "Non clear cell RCC (nccRCC) Treatment Landscape";
      const range = { start: 0, end: fullPhrase.length };
      const result = shrinkRangeToContainKeyTerm(doc, range, ["Landscape"]);
      expect(result.start).toBe(0);
      expect(result.end).toBe(fullPhrase.length);
      expect(result.end - result.start).toBeGreaterThan(10);
      const highlighted = doc.substring(result.start, result.end);
      expect(highlighted).not.toBe("Landscape");
      expect(highlighted).toBe(fullPhrase);
    });

    it("still shrinks to short abbreviation RCC", () => {
      const doc = "First-Line advanced RCC (aRCC) Treatment.";
      const range = { start: 0, end: 38 };
      const result = shrinkRangeToContainKeyTerm(doc, range, ["RCC"]);
      expect(result.start).toBeGreaterThanOrEqual(0);
      expect(result.end - result.start).toBeLessThanOrEqual(10);
      expect(doc.substring(result.start, result.end).toLowerCase()).toContain("rcc");
    });
  });

  describe("validateWordRange", () => {
    const doc = "Hello world. Another sentence.";

    it("accepts valid range with text", () => {
      expect(validateWordRange({ start: 0, end: 5 }, doc)).toBe(true);
      expect(validateWordRange({ start: 13, end: 20 }, doc)).toBe(true);
    });

    it("rejects invalid bounds", () => {
      expect(validateWordRange({ start: -1, end: 5 }, doc)).toBe(false);
      expect(validateWordRange({ start: 0, end: 0 }, doc)).toBe(false);
      expect(validateWordRange({ start: 5, end: 3 }, doc)).toBe(false);
      expect(validateWordRange({ start: 0, end: 100 }, doc)).toBe(false);
    });

    it("rejects empty or whitespace-only range", () => {
      expect(validateWordRange({ start: 5, end: 6 }, "x  y")).toBe(false);
    });

    it("rejects single-character range so we never highlight only one character", () => {
      expect(validateWordRange({ start: 0, end: 1 }, "ab")).toBe(false);
      expect(validateWordRange({ start: 2, end: 3 }, "xy")).toBe(false);
    });

    it("rejects range longer than RANGE_MAX_LENGTH", () => {
      const longDoc = "a".repeat(RANGE_MAX_LENGTH + 10);
      expect(validateWordRange({ start: 0, end: longDoc.length }, longDoc)).toBe(false);
    });
  });

  describe("findTextInDocument", () => {
    it("finds exact match", () => {
      const doc = "First-Line advanced RCC (aRCC) Treatment.";
      const r = findTextInDocument(doc, "advanced RCC");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end)).toBe("advanced RCC");
      expect(r.start).toBeGreaterThanOrEqual(0);
      expect(r.end - r.start).toBe("advanced RCC".length);
    });

    it("finds case-insensitive match", () => {
      const doc = "Follow-Up and RCC here.";
      const r = findTextInDocument(doc, "follow-up");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end).toLowerCase()).toBe("follow-up");
    });

    it("finds word sequence with extra whitespace", () => {
      const doc = "First   Line   advanced   RCC.";
      const r = findTextInDocument(doc, "First Line advanced");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(r.start).toBe(0);
    });

    it("returns null for missing text", () => {
      // Use a phrase long enough to skip recursive Strategy 16 (length < 50)
      expect(findTextInDocument("hello world", "xyzw not in document at all")).toBeNull();
      expect(findTextInDocument("", "x")).toBeNull();
    });
  });

  describe("findTextInDocumentForIssue", () => {
    it("finds and shrinks to key term when issue has quoted term", () => {
      const doc = "Some intro. First-Line advanced RCC (aRCC) Treatment. More text.";
      const issue = { issue: "Abbreviation 'RCC' not defined.", recommendation: "Define 'RCC' at first use." };
      const r = findTextInDocumentForIssue(doc, "First-Line advanced RCC (aRCC) Treatment", issue);
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end).toLowerCase()).toContain("rcc");
    });

    it("highlights 7 Topics not PhD when recommendation quotes 7 Topics", () => {
      const doc =
        "Julia Zhang, MD, PhD\n\n7 Topics:\n- Current Practice\n- Insights.";
      const issue = {
        issue: "Heading begins with a numeral.",
        recommendation: "Change '7 Topics:' to 'Seven Topics:'.",
      };
      const r = findTextInDocumentForIssue(doc, "7 Topics:", issue);
      expect(r).not.toBeNull();
      if (!r) return;
      const highlighted = doc.substring(r.start, r.end);
      expect(highlighted).toMatch(/7\s*Topics/);
      expect(highlighted).not.toContain("PhD");
    });

    it("finds 7 Topics: with colon in document", () => {
      const doc = "Some text. 7 Topics:\n- Item one.";
      expect(findTextInDocument(doc, "7 Topics:")).not.toBeNull();
      const r = findTextInDocument(doc, "7 Topics:");
      if (!r) return;
      expect(doc.substring(r.start, r.end)).toMatch(/7\s*Topics:?/);
    });

    it("highlights full phrase Quality of life not just one word", () => {
      const doc = "• Quality of life\n• Other topic.";
      const issue = {
        issue: "Inconsistent capitalization.",
        recommendation: "Change 'Quality of life' to 'Quality of Life'.",
      };
      const r = findTextInDocumentForIssue(doc, "Quality of life", issue);
      expect(r).not.toBeNull();
      if (!r) return;
      const highlighted = doc.substring(r.start, r.end);
      expect(highlighted).toBe("Quality of life");
    });

    it("highlights full topic phrase not just Landscape", () => {
      const doc = "• Non clear cell RCC (nccRCC) Treatment Landscape\n• Quality of life.";
      const issue = {
        recommendation: "The phrase 'Treatment Landscape' should be consistent.",
      };
      const r = findTextInDocumentForIssue(doc, "Non clear cell RCC (nccRCC) Treatment Landscape", issue);
      expect(r).not.toBeNull();
      if (!r) return;
      const highlighted = doc.substring(r.start, r.end);
      expect(highlighted).not.toBe("Landscape");
      expect(highlighted).toContain("Treatment");
      expect(highlighted).toContain("Landscape");
      expect(highlighted.length).toBeGreaterThan(10);
    });

    it("returns range when no key terms (normal find)", () => {
      const doc = "Only one occurrence of phrase here.";
      const r = findTextInDocumentForIssue(doc, "only one occurrence", {});
      expect(r).not.toBeNull();
      if (!r) return;
      expect(r.start).toBe(0);
    });

    it("returns null when text not in document", () => {
      expect(
        findTextInDocumentForIssue("short doc", "long missing phrase not here", { issue: "'X'" })
      ).toBeNull();
    });

    it("never highlights only one character when searching for a phrase", () => {
      const doc = "Input: - using a transcript and more text.";
      const r = findTextInDocumentForIssue(doc, "using a transcript", {});
      expect(r).not.toBeNull();
      if (!r) return;
      const highlighted = doc.substring(r.start, r.end);
      expect(highlighted.length).toBeGreaterThan(1);
      expect(highlighted).not.toMatch(/^\s*.\s*$/);
      expect(highlighted).toContain("transcript");
    });

    it("when recommendation has Treatment Landscape we highlight full phrase not just Landscape", () => {
      const doc = "• Non clear cell RCC (nccRCC) Treatment Landscape\n• Quality of life.";
      const issue = { recommendation: "Change 'Treatment Landscape' to 'Treatment landscape'." };
      const r = findTextInDocumentForIssue(doc, "Treatment Landscape", issue);
      expect(r).not.toBeNull();
      if (!r) return;
      const highlighted = doc.substring(r.start, r.end);
      expect(highlighted).toBe("Treatment Landscape");
      expect(highlighted).not.toBe("Landscape");
    });

    it("findTextInDocumentFrom returns next occurrence so each issue gets its own highlight", () => {
      const doc = "made 2 attempts using GPT 4o. Later: made 2 attempts using again.";
      const first = findTextInDocument(doc, "made 2 attempts using");
      expect(first).not.toBeNull();
      if (!first) return;
      expect(doc.substring(first.start, first.end)).toBe("made 2 attempts using");
      const next = findTextInDocumentFrom(doc, "made 2 attempts using", first.end + 1);
      expect(next).not.toBeNull();
      if (!next) return;
      expect(next.start).toBeGreaterThanOrEqual(first.end);
      expect(doc.substring(next.start, next.end)).toBe("made 2 attempts using");
    });

    it("findTextInDocumentForIssueFrom returns range at or after minStart so click opens correct comment", () => {
      const doc = "Attempt #1 (GTP 4o): poor. Attempt #2 (GTP 4o): better.";
      const issue = { recommendation: "Fix GTP 4o typo." };
      const r1 = findTextInDocumentForIssue(doc, "GTP 4o", issue);
      expect(r1).not.toBeNull();
      if (!r1) return;
      const r2 = findTextInDocumentForIssueFrom(doc, "GTP 4o", issue, r1.end + 1);
      expect(r2).not.toBeNull();
      if (!r2) return;
      expect(r2.start).toBeGreaterThanOrEqual(r1.end);
      expect(doc.substring(r2.start, r2.end)).toContain("GTP");
    });
  });

  describe("extractSearchTextFromIssue", () => {
    it("extracts quoted text from issue", () => {
      const issue = { issue: 'The button says "Submit" but should say "Send".' };
      const texts = extractSearchTextFromIssue(issue);
      expect(texts.some((t) => t.includes("Submit") || t.includes("Send"))).toBe(true);
    });
  });

  describe("normalizeText and tokenizeText", () => {
    it("normalizes whitespace", () => {
      expect(normalizeText("  a   b  \n  c  ")).toBe("a b c");
    });

    it("tokenizes into words", () => {
      expect(tokenizeText("First-Line RCC (aRCC)")).toEqual(["first-line", "rcc", "arcc"]);
    });
  });

  describe("Word document: apostrophes and quotes (all cases)", () => {
    it("matches text with straight apostrophe don't", () => {
      const doc = "We don't recommend it.";
      const r = findTextInDocument(doc, "don't");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end)).toMatch(/don't/);
    });

    it("matches when document has curly apostrophe and search has straight", () => {
      const doc = "Patient\u2019s guide"; // curly apostrophe U+2019
      const r = findTextInDocument(doc, "Patient's guide");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end)).toContain("Patient");
      expect(doc.substring(r.start, r.end)).toContain("guide");
    });

    it("matches when issue has curly quote in term and doc has straight", () => {
      const doc = "Define RCC at first use.";
      const issue = { recommendation: "The abbreviation \u2018RCC\u2019 should be defined." };
      const terms = extractKeyTermsFromIssue(issue);
      expect(terms).toContain("RCC");
    });

    it("extracts quoted term with double curly quotes", () => {
      const issue = { recommendation: "Change \u201CQuality of life\u201D to \u201CQuality of Life\u201D." };
      const phrases = extractQuotedPhraseFromRecommendation(issue);
      expect(phrases.some((p) => p.includes("Quality"))).toBe(true);
    });

    it("findTextInDocument finds phrase with mixed quote styles", () => {
      const doc = "Topic: \u201CQuality of life\u201D in oncology.";
      const r = findTextInDocument(doc, "Quality of life");
      expect(r).not.toBeNull();
      if (!r) return;
      expect(doc.substring(r.start, r.end).replace(/\s/g, " ")).toMatch(/Quality\s+of\s+life/);
    });

    it("handles it's and possessive in document", () => {
      const doc = "It's the patient's right.";
      expect(findTextInDocument(doc, "It's")).not.toBeNull();
      expect(findTextInDocument(doc, "patient's")).not.toBeNull();
    });

    it("handles single-quoted term in recommendation", () => {
      const issue = { recommendation: "Change '7 Topics:' to 'Seven Topics:'." };
      const phrases = extractQuotedPhraseFromRecommendation(issue);
      expect(phrases).toContain("7 Topics:");
      expect(phrases).toContain("Seven Topics:");
    });

    it("extracts phrase when recommendation uses curly single quotes", () => {
      const issue = { recommendation: "Change \u2018Treatment Landscape\u2019 to \u2018Treatment landscape\u2019." };
      const phrases = extractQuotedPhraseFromRecommendation(issue);
      expect(phrases.some((p) => p.includes("Treatment"))).toBe(true);
    });
  });

  describe("constants", () => {
    it("RANGE_MAX_LENGTH and SEARCH_TEXT_MAX_DOC_RATIO are numbers", () => {
      expect(typeof RANGE_MAX_LENGTH).toBe("number");
      expect(RANGE_MAX_LENGTH).toBe(500);
      expect(typeof SEARCH_TEXT_MAX_DOC_RATIO).toBe("number");
      expect(SEARCH_TEXT_MAX_DOC_RATIO).toBe(0.5);
    });
  });
});
