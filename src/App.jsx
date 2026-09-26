import { useEffect, useState } from 'react';
import ReportForm from './components/ReportForm';
import { syncPending, pendingCount } from './lib/offlineQueue';

export default function App() {
  const [role, setRole] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const goOnline = async () => { setIsOnline(true); await syncPending(); refresh(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    refresh();
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const refresh = async () => setPending(await pendingCount());

  if (!role) {
    return (
      <div className="app centered">
        <h1>MotoMap47</h1>
        <p className="tagline">Report a fire incident</p>
        <div className="role-buttons">
          <button onClick={() => setRole('officer')}>I'm a fire officer</button>
          <button onClick={() => setRole('public')}>I'm a member of the public</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>MotoMap47</h1>
        <span className={`connection-badge ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </header>

      {pending > 0 && (
        <p className="pending-banner">{pending} report{pending > 1 ? 's' : ''} waiting to sync</p>
      )}

      <ReportForm reporterRole={role} onSubmitted={refresh} />

      <button className="link-button" onClick={() => setRole(null)}>Switch role</button>
    </div>
  );
}
