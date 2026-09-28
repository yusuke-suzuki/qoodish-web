export type HighlightPart = {
  text: string;
  highlight: boolean;
  start: number;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function highlightMatches(text: string, query: string): HighlightPart[] {
  const terms = query
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .sort((a, b) => b.length - a.length);

  if (terms.length < 1) {
    return text ? [{ text, highlight: false, start: 0 }] : [];
  }

  const pattern = new RegExp(terms.map(escapeRegExp).join('|'), 'gi');
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (
    let match = pattern.exec(text);
    match !== null;
    match = pattern.exec(text)
  ) {
    if (match.index > cursor) {
      parts.push({
        text: text.slice(cursor, match.index),
        highlight: false,
        start: cursor
      });
    }

    parts.push({ text: match[0], highlight: true, start: match.index });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlight: false, start: cursor });
  }

  return parts;
}
