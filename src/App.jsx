import { useEffect, useState, useCallback } from 'react';
import ReportForm from './components/ReportForm';
import Hero from './components/Hero';
import EmergencyNotice from './components/EmergencyNotice';
import Footer from './components/Footer';
import LiveStats from './components/LiveStats';
import RecentIncidents from './components/RecentIncidents';
import ThemeToggle from './components/ThemeToggle';
import InstallButton from './components/InstallButton';
import OfflineBanner from './components/OfflineBanner';
import QueueList from './components/QueueList';
import { useTheme } from './lib/theme';
import { syncPending, pendingCount } from './lib/offlineQueue';

export default function App() {
  const { mode, resolved, cycle } = useTheme();
  const [role, setRole] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [queueKey, setQueueKey] = useState(0);

  const refresh = useCallback(async () => {
    setPending(await pendingCount());
    setQueueKey((k) => k + 1);
  }, []);

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
  }, [refresh]);

  return (
    <div className="app">
      <div className="top-bar">
        <ThemeToggle mode={mode} onCycle={cycle} />
        <InstallButton />
      </div>

      <OfflineBanner isOnline={isOnline} pendingCount={pending} />
      <EmergencyNotice />

      {!role ? (
        <div className="landing">
          <Hero />
          <LiveStats />
          <RecentIncidents />
          <div className="role-buttons">
            <button onClick={() => setRole('officer')}>
              <span className="role-icon">🚒</span>
              <span>I'm a fire officer</span>
              <span className="role-subtext">Log an incident from the field</span>
            </button>
            <button onClick={() => setRole('public')}>
              <span className="role-icon">🙋</span>
              <span>I'm a member of the public</span>
              <span className="role-subtext">Report something you've seen</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="report-screen">
          <header>
            <h1>MotoMap47</h1>
          </header>
          <ReportForm reporterRole={role} theme={resolved} onSubmitted={refresh} />
          <QueueList refreshKey={queueKey} onSynced={refresh} />
          <button className="link-button" onClick={() => setRole(null)}>← Switch role</button>
        </div>
      )}

      <Footer />
    </div>
  );
}
