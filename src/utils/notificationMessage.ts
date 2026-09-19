// The API still names a pin "review" in notification payloads, so that
// clients released before the rename keep resolving their message.
const RENAMED_NOTIFIABLE_TYPES: Record<string, string> = {
  review: 'pin'
};

export function notificationMessageKey(
  key: string,
  notifiableType: string
): string {
  return `${key} ${RENAMED_NOTIFIABLE_TYPES[notifiableType] ?? notifiableType}`;
}
