/* TableTop — shared UI kit + helpers. Exports to window for cross-file use. */

// ---- tiny inline icon set (Lucide-style, 1.75 stroke, currentColor) ----
function Icon({ name, size = 18, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round',
    strokeLinejoin: 'round', style };
  const paths = {
    sun: <g><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
    back: <path d="M15 18l-6-6 6-6" />,
    up: <path d="M12 19V5M5 12l7-7 7 7" />,
    down: <path d="M12 5v14M19 12l-7 7-7-7" />,
    shuffle: <g><path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5" /></g>,
    reverse: <g><path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></g>,
    chevUp: <path d="M18 15l-6-6-6 6" />,
    chevDown: <path d="M6 9l6 6 6-6" />,
    copy: <g><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></g>,
    check: <path d="M20 6L9 17l-5-5" />,
    timer: <g><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></g>,
    flag: <g><path d="M4 22V4M4 4s1-1 4-1 4 2 7 2 4-1 4-1v11s-1 1-4 1-4-2-7-2-4 1-4 1" /></g>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    play: <path d="M6 4l14 8-14 8V4z" fill="currentColor" stroke="none" />,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

// ---- helpers ----
const pad2 = (n) => String(n).padStart(2, '0');
function fmtClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}
function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

// ---- small components ----
function Kicker({ children, style }) {
  return <div className="kicker" style={style}>{children}</div>;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="iconbtn" onClick={onToggle} aria-label="Toggle theme" title="Toggle theme">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button className="iconbtn" onClick={onClick} aria-label="Back">
      <Icon name="back" />
    </button>
  );
}

function Wordmark() {
  return <div className="wordmark">tabletop<span className="dot">.</span></div>;
}

// index row: array of labels, currentIndex highlighted, done before it dimmed
function IndexRow({ count, current }) {
  return (
    <div className="indexrow">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={'idx' + (i === current ? ' is-current' : i < current ? ' is-done' : '')}
        >
          {pad2(i + 1)}
        </span>
      ))}
    </div>
  );
}

function StatusBar() {
  return <div className="statusbar"><div className="notch" /></div>;
}

Object.assign(window, {
  Icon, pad2, fmtClock, initials,
  Kicker, ThemeToggle, BackBtn, Wordmark, IndexRow, StatusBar,
});
