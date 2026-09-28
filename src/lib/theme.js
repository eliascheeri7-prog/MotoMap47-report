import { useEffect, useState } from 'react';

const STORAGE_KEY = 'motomap47-theme'; // 'light' | 'dark' | 'auto'

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'auto');
  const resolved = mode === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => document.documentElement.setAttribute('data-theme', systemPrefersDark() ? 'dark' : 'light');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [mode]);

  const cycle = () => {
    const next = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto';
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { mode, resolved, cycle };
}
