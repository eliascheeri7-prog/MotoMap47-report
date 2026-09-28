export default function OfflineBanner({ isOnline, pendingCount }) {
  if (isOnline) return null;
  return (
    <div className="offline-banner">
      📶 You're offline — reports are saved on this device
      {pendingCount > 0 && ` (${pendingCount} waiting)`} and will send automatically once you're back online.
    </div>
  );
}
