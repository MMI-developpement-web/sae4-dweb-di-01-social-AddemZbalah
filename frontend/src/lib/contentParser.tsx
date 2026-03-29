/**
 * Utility to parse mentions and hashtags from text
 * US 3.5: Hashtags and mentions support
 */

export interface ParsedElement {
  type: "text" | "mention" | "hashtag";
  content: string;
  fullMatch?: string;
}

/**
 * Parse text and extract mentions (@username) and hashtags (#tag)
 */
export function parseContent(text: string): ParsedElement[] {
  if (!text) return [];

  const elements: ParsedElement[] = [];
  const regex = /(@\w+|#\w+)/g;
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention or hashtag
    const fullMatch = match[0];
    if (fullMatch.startsWith("@")) {
      elements.push({
        type: "mention",
        content: fullMatch.substring(1),
        fullMatch,
      });
    } else if (fullMatch.startsWith("#")) {
      elements.push({
        type: "hashtag",
        content: fullMatch.substring(1),
        fullMatch,
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  return elements;
}

/**
 * Convert parsed elements back to highlighted HTML
 */
export function renderHighlightedContent(elements: ParsedElement[]) {
  return elements.map((el, idx) => {
    if (el.type === "text") {
      return <span key={idx}>{el.content}</span>;
    }

    if (el.type === "mention") {
      return (
        <a
          key={idx}
          href={`/profile/${el.content}`}
          className="text-primary hover:underline"
        >
          @{el.content}
        </a>
      );
    }

    if (el.type === "hashtag") {
      return (
        <a
          key={idx}
          href={`/search?q=%23${el.content}`}
          className="text-primary hover:underline"
        >
          #{el.content}
        </a>
      );
    }

    return null;
  });
}

/**
 * Extract all mentions and hashtags from content
 */
export function extractMetadata(
  text: string
): {
  mentions: string[];
  hashtags: string[];
} {
  const mentions = new Set<string>();
  const hashtags = new Set<string>();

  const regex = /(@\w+|#\w+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    if (fullMatch.startsWith("@")) {
      mentions.add(fullMatch.substring(1));
    } else if (fullMatch.startsWith("#")) {
      hashtags.add(fullMatch.substring(1));
    }
  }

  return {
    mentions: Array.from(mentions),
    hashtags: Array.from(hashtags),
  };
}
