export function characters(text: string): number {
  return [...text].length;
}

export function withoutCarriageReturns(text: string): string {
  return text.replaceAll('\r', '');
}

export function truncate(text: string, length: number): string {
  const omission = '...';

  if (characters(text) <= length) {
    return text;
  }

  return `${[...text].slice(0, length - omission.length).join('')}${omission}`;
}
