/* TableTop — Home, Join, Lobby, End screens. */

const { useState: useS } = React;

/* ----------------------------------------------------------------- HOME */
function HomeScreen({ name, setName, onCreate, onJoin, theme, onTheme }) {
  return (
    <div className="screen">
      <div className="topbar">
        <Wordmark />
        <ThemeToggle theme={theme} onToggle={onTheme} />
      </div>

      <div className="home-hero">
        <Kicker style={{ marginBottom: 22 }}>Turn order, settled</Kicker>
        <h1 className="home-display" style={{ fontFamily: "Montserrat", letterSpacing: "-0.1px", fontWeight: "700" }}>Whose<br />turn<br />is it<b className="home-q" style={{ gap: "0px", borderRadius: "50px", margin: "0px 0px -7px 10px" }}></b></h1>
        <p className="home-lead">One tap to pass the turn.
No more “wait, who’s next.”</p>
      </div>

      <div className="home-actions">
        <div className="field" style={{ marginBottom: 8 }}>
          <label className="kicker">Your name</label>
          <input className="uline" value={name} maxLength={18}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name at the table" />
          
        </div>
        <button className="btn btn-primary" onClick={onCreate} disabled={!name.trim()}>
          Create a table
        </button>
        <button className="btn btn-ghost" onClick={onJoin}>Join with a code</button>
        <div className="home-foot">No account needed</div>
      </div>
    </div>);

}

/* ----------------------------------------------------------------- JOIN */
function JoinScreen({ onBack, onJoin, theme, onTheme }) {
  const [code, setCode] = useS('');
  const [err, setErr] = useS(false);

  const press = (d) => {
    setErr(false);
    if (d === 'del') return setCode((c) => c.slice(0, -1));
    setCode((c) => c.length < 4 ? c + d : c);
  };
  const go = () => {
    if (code.length === 4) onJoin(code);else
    setErr(true);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'go'];

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <ThemeToggle theme={theme} onToggle={onTheme} />
      </div>

      <div className="join-body">
        <div style={{ flex: '0 0 auto', marginTop: 26 }}>
          <Kicker>Join a table</Kicker>
          <h2 className="home-display" style={{ fontSize: 40, marginTop: 12 }}>Enter code</h2>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="code-cells">
            {[0, 1, 2, 3].map((i) =>
            <div key={i} className={'code-cell' + (code[i] ? ' filled' : '') + (i === code.length ? ' active' : '')}>
                {code[i] || ''}
              </div>
            )}
          </div>
          <div className="code-err" style={{ opacity: err ? 1 : 0 }}>Enter all four digits</div>
        </div>

        <div className="keypad">
          {keys.map((k) => {
            if (k === 'del') return (
              <button key={k} className="key key-flat" onClick={() => press('del')} aria-label="Delete">
                <Icon name="back" size={22} />
              </button>);

            if (k === 'go') return (
              <button key={k} className="key" style={{ background: 'var(--accent)', color: '#fff' }} onClick={go} aria-label="Join">
                <Icon name="play" size={20} />
              </button>);

            return <button key={k} className="key" onClick={() => press(k)}>{k}</button>;
          })}
        </div>
      </div>
    </div>);

}

/* ---------------------------------------------------------------- LOBBY */
function LobbyScreen(props) {
  const {
    code, role, players, move, shuffle, reverse,
    config, setConfig, onStart, onBack, theme, onTheme
  } = props;
  const [copied, setCopied] = useS(false);
  const isHost = role === 'host';

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);setTimeout(() => setCopied(false), 1400);
  };
  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  return (
    <div className="screen">
      <div className="topbar">
        <BackBtn onClick={onBack} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Kicker>{isHost ? 'Hosting' : 'Joined'}</Kicker>
          <ThemeToggle theme={theme} onToggle={onTheme} />
        </div>
      </div>

      <div className="lobby-body">
        <Kicker style={{ marginTop: 14 }}>Room code</Kicker>
        <div className="code-display">
          <div className="code-big">{code}</div>
          <button className="linkbtn code-copy" onClick={copy}>
            <Icon name={copied ? 'check' : 'copy'} size={15} />
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
        <div className="hairline" style={{ marginTop: 14 }} />

        {/* turn order */}
        <div className="section-head">
          <Kicker>Turn order</Kicker>
          {isHost && <span className="section-hint">reorder with arrows</span>}
        </div>

        {isHost &&
        <div className="pill-row">
            <button className="pill" onClick={shuffle}><Icon name="shuffle" size={15} />Shuffle</button>
            <button className="pill" onClick={reverse}><Icon name="reverse" size={15} />Reverse</button>
          </div>
        }

        <div className="plist">
          {players.map((p, i) =>
          <div key={p.id} className="prow">
              <span className="prow-idx">{pad2(i + 1)}</span>
              <span className="prow-name">{p.name}</span>
              {p.host && <span className="tag">host</span>}
              {isHost &&
            <div className="prow-arrows">
                  <button className="arrow" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Up">
                    <Icon name="up" size={15} />
                  </button>
                  <button className="arrow" disabled={i === players.length - 1} onClick={() => move(i, i + 1)} aria-label="Down">
                    <Icon name="down" size={15} />
                  </button>
                </div>
            }
            </div>
          )}
        </div>

        {isHost ?
        <React.Fragment>
            {/* settings */}
            <Kicker style={{ marginTop: 28, display: 'block' }}>Per-turn timer</Kicker>
            <div className="setting-row">
              <span className="setting-label">{config.timerOn ? `${config.turnSecs}s each turn` : 'Off'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {config.timerOn &&
              <div className="stepper">
                    <button className="step" onClick={() => set('turnSecs', Math.max(15, config.turnSecs - 15))}><Icon name="minus" size={15} /></button>
                    <span className="step-val">{config.turnSecs}</span>
                    <button className="step" onClick={() => set('turnSecs', Math.min(180, config.turnSecs + 15))}><Icon name="plus" size={15} /></button>
                  </div>
              }
                <button className={'switch' + (config.timerOn ? ' on' : '')} onClick={() => set('timerOn', !config.timerOn)} aria-label="Toggle timer" />
              </div>
            </div>

            <Kicker style={{ marginTop: 24, display: 'block', marginBottom: 12 }}>How it ends</Kicker>
            <div className="seg">
              {[['open', 'Open'], ['fixed', 'Rounds'], ['trigger', 'Trigger']].map(([v, l]) =>
            <button key={v} className={'seg-opt' + (config.endMode === v ? ' active' : '')} onClick={() => set('endMode', v)}>{l}</button>
            )}
            </div>
            {config.endMode === 'open' && <p className="seg-desc">Ends when the host calls it.</p>}
            {config.endMode === 'trigger' && <p className="seg-desc">Any player can fire the end-game trigger — the current round finishes first.</p>}
            {config.endMode === 'fixed' &&
          <div className="setting-row" style={{ marginTop: 6 }}>
                <span className="setting-label">Number of rounds</span>
                <div className="stepper">
                  <button className="step" onClick={() => set('fixedRounds', Math.max(1, config.fixedRounds - 1))}><Icon name="minus" size={15} /></button>
                  <span className="step-val">{config.fixedRounds}</span>
                  <button className="step" onClick={() => set('fixedRounds', Math.min(20, config.fixedRounds + 1))}><Icon name="plus" size={15} /></button>
                </div>
              </div>
          }
          </React.Fragment> :

        <p className="waiting">Waiting for the host to start…<br /><button className="linkbtn" style={{ color: 'var(--accent)' }} onClick={() => onStart(false)}>▶ Simulate host starting</button></p>
        }
      </div>

      {isHost &&
      <div className="lobby-actions">
          <button className="btn btn-ghost" onClick={() => onStart(true)}>Random start</button>
          <button className="btn btn-primary" onClick={() => onStart(false)}>Start game</button>
        </div>
      }
    </div>);

}

/* ------------------------------------------------------------------ END */
function EndScreen({ stats, onAgain, onHome, theme, onTheme }) {
  return (
    <div className="screen end-screen">
      <div className="topbar" style={{ position: 'absolute', top: 30, left: 30, right: 30 }}>
        <Wordmark />
        <ThemeToggle theme={theme} onToggle={onTheme} />
      </div>

      <div className="end-hero">
        <Kicker>Game over</Kicker>
        <h1 className="end-title">That’s a<br />wrap<b>.</b></h1>
      </div>

      <div className="stats">
        <div className="stat-row"><span className="stat-label">Duration</span><span className="stat-val">{fmtClock(stats.duration)}</span></div>
        <div className="stat-row"><span className="stat-label">Rounds played</span><span className="stat-val">{stats.rounds}</span></div>
        <div className="stat-row"><span className="stat-label">Players</span><span className="stat-val">{stats.players}</span></div>
        <div className="stat-row"><span className="stat-label">Turns taken</span><span className="stat-val">{stats.turns}</span></div>
      </div>

      <div className="end-actions">
        <button className="btn btn-primary" onClick={onAgain}>Play again</button>
        <button className="btn btn-ghost" onClick={onHome}>Back to home</button>
      </div>
    </div>);

}

Object.assign(window, { HomeScreen, JoinScreen, LobbyScreen, EndScreen });