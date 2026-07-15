/* TableTop — Game screen. The giant green→red turn button is the centerpiece. */

const { useState, useEffect, useRef, useCallback } = React;

const RING = 132;            // ring radius
const RING_LEN = 2 * Math.PI * RING;

function GameScreen(props) {
  const {
    players, activeIndex, round, endMode, fixedRounds,
    timerOn, turnSecs, sessionElapsed,
    onEndTurn, onEndGame, theme, onTheme,
  } = props;

  const [passing, setPassing] = useState(false);     // red hand-off animation
  const [showOrder, setShowOrder] = useState(false);
  const [secsLeft, setSecsLeft] = useState(turnSecs);
  const busy = useRef(false);

  const current = players[activeIndex];
  const nextIndex = (activeIndex + 1) % players.length;

  // ---- the core action: end this turn, hand off (green → red → green) ----
  const endTurn = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setPassing(true);
    setTimeout(() => {
      onEndTurn();
      setPassing(false);
      busy.current = false;
    }, 480);
  }, [onEndTurn]);

  // ---- per-turn countdown ----
  useEffect(() => {
    setSecsLeft(turnSecs);
    if (!timerOn) return;
    const id = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) { clearInterval(id); endTurn(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeIndex, timerOn, turnSecs, endTurn]);

  const pct = timerOn ? Math.max(0, secsLeft / turnSecs) : 1;
  const lowTime = timerOn && pct < 0.25;
  const ringColor = passing ? 'var(--stop)' : lowTime ? 'var(--stop)' : 'var(--go)';

  return (
    <div className="screen game">
      {/* top bar */}
      <div className="topbar">
        <div className="game-meta">
          <Kicker>Round</Kicker>
          <div className="game-round">{pad2(round)}<span className="game-round-of">
            {endMode === 'fixed' ? ` / ${pad2(fixedRounds)}` : ''}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="game-clock">
            <Kicker>Session</Kicker>
            <div className="game-clock-val">{fmtClock(sessionElapsed)}</div>
          </div>
          <ThemeToggle theme={theme} onToggle={onTheme} />
        </div>
      </div>

      {/* player index row */}
      <div style={{ marginTop: 22 }}>
        <IndexRow count={players.length} current={activeIndex} />
      </div>

      {/* the giant button */}
      <div className="turn-stage">
        <button
          className={'turn-btn' + (passing ? ' is-passing' : ' is-go')}
          onClick={endTurn}
          aria-label={`End ${current.name}'s turn`}
        >
          <span className="turn-disc" />
          <svg className="turn-ring" viewBox="0 0 296 296">
            <circle className="turn-ring-track" cx="148" cy="148" r={RING} />
            {timerOn && (
              <circle
                className="turn-ring-fill" cx="148" cy="148" r={RING}
                stroke={ringColor}
                strokeDasharray={RING_LEN}
                strokeDashoffset={RING_LEN * (1 - pct)}
              />
            )}
          </svg>
          <span className="turn-num numeral">{pad2(activeIndex + 1)}</span>
          <span className="turn-cta">
            {passing ? 'Passing…' : 'Tap to end turn'}
          </span>
          {timerOn && !passing && (
            <span className="turn-secs">{secsLeft}s</span>
          )}
        </button>
      </div>

      {/* active player name */}
      <div className="active-name">
        <span className="active-dot" style={{ background: passing ? 'var(--stop)' : 'var(--go)' }} />
        <span className="active-name-txt">{passing ? players[nextIndex].name : current.name}</span>
      </div>
      <div className="active-sub kicker">
        {passing ? 'Up next' : (activeIndex === 0 && round === 1 ? 'Starting player' : 'Now playing')}
      </div>

      {/* expandable turn order + controls */}
      <div className="game-foot">
        <button className="order-toggle" onClick={() => setShowOrder((v) => !v)}>
          <Icon name={showOrder ? 'chevDown' : 'chevUp'} size={16} />
          <span>{showOrder ? 'Hide order' : 'Turn order'}</span>
        </button>
      </div>

      {/* slide-up sheet */}
      <div className={'order-sheet' + (showOrder ? ' open' : '')}>
        <div className="order-sheet-inner">
          <div className="order-grip" />
          <Kicker style={{ marginBottom: 14 }}>Turn order · {players.length} players</Kicker>
          <div className="order-list">
            {players.map((p, i) => {
              const isCur = i === activeIndex;
              const done = i < activeIndex;
              return (
                <div key={p.id} className={'order-item' + (isCur ? ' cur' : done ? ' done' : '')}>
                  <span className="order-idx numeral">{pad2(i + 1)}</span>
                  <span className="order-name">{p.name}</span>
                  {p.host && <span className="tag">host</span>}
                  {isCur && <span className="active-dot" style={{ background: 'var(--go)' }} />}
                </div>
              );
            })}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={onEndGame}>
            End game
          </button>
        </div>
      </div>
      {showOrder && <div className="sheet-scrim" onClick={() => setShowOrder(false)} />}
    </div>
  );
}

window.GameScreen = GameScreen;
