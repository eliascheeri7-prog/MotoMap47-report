import { useEffect, useState } from 'react';
import { listPending, syncPending } from '../lib/offlineQueue';

export default function QueueList({ refreshKey, onSynced }) {
  const [items, setItems] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { listPending().then(setItems); }, [refreshKey]);

  if (items.length === 0) return null;

  const retry = async () => {
    setSyncing(true);
    await syncPending();
    setItems(await listPending());
    setSyncing(false);
    onSynced?.();
  };

  return (
    <div className="queue-list">
      <div className="queue-list-header">
        <span>Waiting to sync ({items.length})</span>
        <button onClick={retry} disabled={syncing || !navigator.onLine}>
          {syncing ? 'Syncing…' : 'Retry now'}
        </button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.localId}>
            <span>{item.incident_type}</span>
            <span className="queue-item-time">queued {new Date(item.queuedAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
