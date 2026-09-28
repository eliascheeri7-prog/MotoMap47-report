const ICON = { light: '☀️', dark: '🌙', auto: '🌓' };

export default function ThemeToggle({ mode, onCycle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onCycle} title={`Theme: ${mode} (tap to change)`}>
      {ICON[mode]} {mode}
    </button>
  );
}
