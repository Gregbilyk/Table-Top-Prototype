/* TableTop — app root: router, game logic, theme + accent + tweaks. */

const { useState: u, useEffect: uE, useRef: uR, useCallback: uC } = React;

const ROSTER = ['You', 'Maya', 'Leo', 'Priya', 'Sam', 'Nadia', 'Theo', 'Ivy'];
const ACCENTS = {
  '#e8536f': { h: '#d8455f', p: '#c33a52', s: '#fdecef' }, // rose
  '#b42460': { h: '#951a4f', p: '#74143e', s: '#fdeef3' }, // magenta
  '#f06c48': { h: '#db4f29', p: '#b53e1f', s: '#fff1ec' }, // coral
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": true,
  "accent": "#e8536f",
  "players": 4
}/*EDITMODE-END*/;

function makeCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
function seedPlayers(count, myName) {
  return Array.from({ length: count }).map((_, i) => ({
    id: 'p' + i,
    name: i === 0 ? (myName.trim() || 'You') : ROSTER[i],
    host: i === 0,
  }));
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [screen, setScreen] = u('home');     // home | join | lobby | game | end
  const [role, setRole] = u('host');
  const [name, setName] = u('');
  const [code, setCode] = u('4827');
  const [players, setPlayers] = u(() => seedPlayers(4, ''));
  const [config, setConfig] = u({ timerOn: false, turnSecs: 60, endMode: 'open', fixedRounds: 5 });

  // game runtime
  const [activeIndex, setActiveIndex] = u(0);
  const [round, setRound] = u(1);
  const [turns, setTurns] = u(0);
  const [elapsed, setElapsed] = u(0);
  const startTs = uR(0);

  // ---- apply theme ----
  uE(() => {
    document.documentElement.setAttribute('data-theme', t.dark ? 'dark' : 'light');
  }, [t.dark]);

  // ---- apply accent ----
  uE(() => {
    const a = t.accent, x = ACCENTS[a] || ACCENTS['#e8536f'];
    const r = document.documentElement.style;
    r.setProperty('--accent', a);
    r.setProperty('--accent-hover', x.h);
    r.setProperty('--accent-press', x.p);
    r.setProperty('--accent-soft', x.s);
    r.setProperty('--focus-ring', a);
    r.setProperty('--stop', a);
  }, [t.accent]);

  // ---- keep demo roster sized to tweak while not mid-game ----
  uE(() => {
    if (screen === 'home' || screen === 'join') setPlayers(seedPlayers(t.players, name));
  }, [t.players]); // eslint-disable-line

  // ---- session clock ----
  uE(() => {
    if (screen !== 'game') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTs.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const onTheme = () => setTweak('dark', !t.dark);

  // ---- navigation ----
  const goCreate = () => {
    setRole('host'); setPlayers(seedPlayers(t.players, name)); setCode(makeCode()); setScreen('lobby');
  };
  const goJoinScreen = () => setScreen('join');
  const goJoin = (c) => {
    setRole('guest');
    const ps = seedPlayers(t.players, name).map((p, i) => i === 0 ? { ...p, host: false } : p);
    ps[1] = { ...ps[1], host: true };          // someone else hosts
    setPlayers(ps); setCode(c); setScreen('lobby');
  };

  // ---- lobby reorder ----
  const move = (from, to) => setPlayers((arr) => {
    const a = [...arr]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a;
  });
  const shuffle = () => setPlayers((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  });
  const reverse = () => setPlayers((arr) => [...arr].reverse());

  // ---- start ----
  const startGame = (random) => {
    setActiveIndex(random ? (Math.random() * players.length) | 0 : 0);
    setRound(1); setTurns(0); setElapsed(0); startTs.current = Date.now();
    setScreen('game');
  };

  // ---- advance turn ----
  const endTurn = () => {
    setTurns((n) => n + 1);
    setActiveIndex((i) => {
      const next = (i + 1) % players.length;
      const wrapping = next === 0;
      if (wrapping) {
        const nextRound = round + 1;
        if (config.endMode === 'fixed' && nextRound > config.fixedRounds) {
          endGame(); return i;
        }
        setRound(nextRound);
      }
      return next;
    });
  };

  const endGame = () => setScreen('end');
  const playAgain = () => { setScreen('lobby'); };
  const goHome = () => { setScreen('home'); setRole('host'); };

  const stats = { duration: elapsed, rounds: Math.max(round - (activeIndex === 0 ? 1 : 0), 1), players: players.length, turns };

  return (
    <React.Fragment>
      <div className="canvas">
        <StatusBar />
        {screen === 'home' && (
          <HomeScreen name={name} setName={setName} onCreate={goCreate} onJoin={goJoinScreen} theme={t.dark ? 'dark' : 'light'} onTheme={onTheme} />
        )}
        {screen === 'join' && (
          <JoinScreen onBack={goHome} onJoin={goJoin} theme={t.dark ? 'dark' : 'light'} onTheme={onTheme} />
        )}
        {screen === 'lobby' && (
          <LobbyScreen
            code={code} role={role} players={players} move={move} shuffle={shuffle} reverse={reverse}
            config={config} setConfig={setConfig} onStart={startGame} onBack={goHome}
            theme={t.dark ? 'dark' : 'light'} onTheme={onTheme}
          />
        )}
        {screen === 'game' && (
          <GameScreen
            players={players} activeIndex={activeIndex} round={round}
            endMode={config.endMode} fixedRounds={config.fixedRounds}
            timerOn={config.timerOn} turnSecs={config.turnSecs} sessionElapsed={elapsed}
            onEndTurn={endTurn} onEndGame={endGame}
            theme={t.dark ? 'dark' : 'light'} onTheme={onTheme}
          />
        )}
        {screen === 'end' && (
          <EndScreen stats={stats} onAgain={playAgain} onHome={goHome} theme={t.dark ? 'dark' : 'light'} onTheme={onTheme} />
        )}
      </div>

      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakColor label="Accent" value={t.accent}
          options={['#e8536f', '#b42460', '#f06c48']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Demo" />
        <TweakSlider label="Players" value={t.players} min={3} max={8} step={1}
          onChange={(v) => setTweak('players', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
