/** Display id like "#3F2A" from a Firestore document id. */
export function shortId(id: string) {
  return `#${id.slice(-4).toUpperCase()}`;
}

/** "Jun 12, 03:42 PM" — compact date + time. */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "Jun 12, 2026, 03:42 PM" — full date for history lists. */
export function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "03:42 PM" — time only. */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** "just now" / "5 min ago" / "1h 12m ago". */
export function minutesAgo(iso: string) {
  const min = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (min === 0) return 'just now';
  if (min === 1) return '1 min ago';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m ago`;
}

/** True when the timestamp falls on the current calendar day. */
export function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}
