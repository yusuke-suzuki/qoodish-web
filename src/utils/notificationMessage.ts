export function notificationMessageKey(
  key: string,
  notifiableType: string
): string {
  return `${key} ${notifiableType}`;
}
