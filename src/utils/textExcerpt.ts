/**
 * Extracts an excerpt from Hebrew text showing the first sentence and beginning of the second
 */
export const extractTextExcerpt = (text: string): { excerpt: string; hasMore: boolean } => {
  if (!text) {
    return { excerpt: '', hasMore: false };
  }

  const trimmed = text.trim();
  
  // Hebrew sentence endings
  const sentenceEnders = /[.!?]/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  // Find all sentence endings
  while ((match = sentenceEnders.exec(trimmed)) !== null) {
    const sentence = trimmed.substring(lastIndex, match.index + 1).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = match.index + 1;
  }

  // Add remaining text as a sentence if it exists
  const remaining = trimmed.substring(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  if (sentences.length === 0) {
    return { excerpt: trimmed, hasMore: false };
  }

  if (sentences.length === 1) {
    return { excerpt: sentences[0], hasMore: false };
  }

  // First sentence + beginning of second (max 30 chars)
  const firstSentence = sentences[0];
  const secondSentenceStart = sentences[1].substring(0, 30);
  const excerpt = `${firstSentence} ${secondSentenceStart}${secondSentenceStart.length >= 30 ? '...' : ''}`;
  
  return {
    excerpt,
    hasMore: true
  };
};