const DOT_SEGMENTS = new Set(['.', '..']);

export default function devicePath(registrationToken: string): string | null {
  if (!registrationToken || DOT_SEGMENTS.has(registrationToken)) {
    return null;
  }

  return `/me/devices/${encodeURIComponent(registrationToken)}`;
}
