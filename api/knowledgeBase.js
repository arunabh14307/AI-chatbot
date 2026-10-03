/**
 * LPU Assist - Verified Knowledge Base Registry
 * 
 * Source-Aware Architecture:
 * Each entry is structured to provide authoritative grounding for the AI assistant.
 * 
 * Entry Schema:
 * - id: unique identifier
 * - question: standard student inquiry
 * - answer: authoritative answer text
 * - sourceTitle: title of official notification / manual / portal guide
 * - sourceUrl: official university URL or portal link
 * - lastVerifiedDate: ISO date string when information was verified
 * 
 * NOTE: As per guidelines, this structure is intentionally initialized clean
 * without invented sources, ready to be populated with verified university circulars.
 */

export const verifiedKnowledgeBase = [
  // Ready to be populated in the next step with official LPU documents.
];

/**
 * Searches the verified knowledge base for entries relevant to the query.
 * @param {string} query - Student question
 * @returns {Array} Array of matching verified entries
 */
export function findKnowledgeMatches(query) {
  if (!query || verifiedKnowledgeBase.length === 0) {
    return [];
  }

  const normalized = query.toLowerCase().trim();
  return verifiedKnowledgeBase.filter(entry => {
    return entry.question.toLowerCase().includes(normalized) ||
           normalized.includes(entry.question.toLowerCase());
  });
}
