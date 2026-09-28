import { useEffect, useState } from 'react';
import { supabase, LIVE_SYNC_ENABLED } from '../lib/supabase';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function RecentIncidents() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!LIVE_SYNC_ENABLED) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('incident_type,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error) setRows(data || []);
    };
    load();
    const channel = supabase.channel('recent-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (!LIVE_SYNC_ENABLED || rows.length === 0) return null;

  return (
    <div className="recent-incidents">
      <div className="recent-incidents-title">Recent reports</div>
      <ul>
        {rows.map((r, i) => (
          <li key={i}>
            <span>{r.incident_type}</span>
            <span className={`status-dot status-${r.status}`} />
            <span className="recent-time">{timeAgo(r.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
