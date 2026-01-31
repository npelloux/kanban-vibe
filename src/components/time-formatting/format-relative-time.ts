export function formatRelativeTime(dateOrTimestamp: Date | number): string {
  const timestamp =
    dateOrTimestamp instanceof Date
      ? dateOrTimestamp.getTime()
      : dateOrTimestamp;
  const now = Date.now();
  const diffMs = now - timestamp;

  if (diffMs < 0) {
    return 'just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  if (diffHours < 24) {
    if (diffHours === 1) {
      return '1 hour ago';
    }
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  return `${diffDays} days ago`;
}
