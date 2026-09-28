import { useEffect, useState } from 'react';
import { supabase, LIVE_SYNC_ENABLED } from '../lib/supabase';

export default function LiveStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!LIVE_SYNC_ENABLED) return;
    const load = async () => {
      const { data, error } = await supabase.from('incidents').select('status');
      if (error) return;
      const active = data.filter((r) => r.status !== 'resolved').length;
      setStats({ total: data.length, active });
    };
    load();
    const channel = supabase.channel('livestats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (!LIVE_SYNC_ENABLED) {
    return <div className="live-stats sample">Live stats need Supabase configured (see README)</div>;
  }
  if (!stats) return <div className="live-stats">Loading live stats…</div>;

  return (
    <div className="live-stats">
      <span><strong>{stats.active}</strong> active</span>
      <span><strong>{stats.total}</strong> reported total</span>
    </div>
  );
}
