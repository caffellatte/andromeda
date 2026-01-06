import { useEffect, useState } from "react";
import {
  Envelope,
  Knob,
  Meter,
  Oscillator,
  Slider,
  Toggle,
} from "./ui";
import { getSynthState, setSynthState } from "./synth";
import "./App.css";

function App() {
  const [env, setEnv] = useState({
    attack: 0.02,
    decay: 0.25,
    sustain: 0.7,
    release: 0.4,
  });
  const [cutoff, setCutoff] = useState(1400);
  const [resonance, setResonance] = useState(0.35);
  const [envAmount, setEnvAmount] = useState(0.55);
  const [noise, setNoise] = useState(0.12);
  const [sub, setSub] = useState(0.3);
  const [drive, setDrive] = useState(0.2);
  const [glide, setGlide] = useState(0.05);
  const [master, setMaster] = useState(0.72);
  const [mono, setMono] = useState(false);
  const [sync, setSync] = useState(true);
  const [osc, setOsc] = useState({
    waveform: "saw",
    tune: 0,
    level: 0.7,
  });
  const [debugState, setDebugState] = useState<string>("{}");
  const [debugPaused, setDebugPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [pollIntervalMs, setPollIntervalMs] = useState(750);

  useEffect(() => {
    void setSynthState({
      envelope: env,
      oscillator: {
        waveform: osc.waveform,
        tune: osc.tune,
        level: osc.level,
        sync,
      },
      filter: {
        cutoff,
        resonance,
        env_amount: envAmount,
        drive,
      },
      mixer: {
        noise,
        sub,
        master,
      },
      global: {
        mono,
        glide,
      },
    });
  }, [
    env,
    osc,
    sync,
    cutoff,
    resonance,
    envAmount,
    drive,
    noise,
    sub,
    master,
    mono,
    glide,
  ]);

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchState = async () => {
      try {
        const state = await getSynthState();
        if (active) {
          setDebugState(JSON.stringify(state, null, 2));
        }
      } catch {
        if (active) {
          setDebugState("{\"error\":\"failed to fetch synth state\"}");
        }
      }
    };
    if (!debugPaused && isFocused) {
      void fetchState();
    }
    const id =
      !debugPaused && isFocused
        ? window.setInterval(fetchState, pollIntervalMs)
        : undefined;
    return () => {
      active = false;
      if (id) {
        window.clearInterval(id);
      }
    };
  }, [debugPaused, isFocused, pollIntervalMs]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.3),_rgba(9,9,11,0.95))] p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">
            Synth Panel
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Andromeda Voice
          </h1>
          <p className="text-sm text-zinc-400">
            Prototype layout to stress spacing, input feel, and disabled states.
          </p>
        </header>

        <section className="rounded-[var(--ui-radius-3)] border border-white/10 bg-zinc-950/60 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.85)]">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-6">
              <Oscillator
                label="Oscillator A"
                waveform={osc.waveform}
                tune={osc.tune}
                level={osc.level}
                onChange={setOsc}
              />

              <div className="grid grid-cols-2 gap-[var(--ui-space-4)]">
                <Toggle label="Mono" checked={mono} onChange={setMono} />
                <Toggle label="Sync" checked={sync} onChange={setSync} />
              </div>

              <div className="grid grid-cols-2 gap-[var(--ui-space-4)]">
                <Knob
                  label="Glide"
                  min={0}
                  max={1}
                  step={0.01}
                  value={glide}
                  unit="s"
                  onChange={setGlide}
                />
                <Knob
                  label="Drive"
                  min={0}
                  max={1}
                  step={0.01}
                  value={drive}
                  onChange={setDrive}
                />
              </div>
            </div>

            <div className="space-y-6">
              <Envelope
                attack={env.attack}
                decay={env.decay}
                sustain={env.sustain}
                release={env.release}
                timeMax={2}
                onChange={setEnv}
              />

              <div className="grid grid-cols-3 gap-[var(--ui-space-4)]">
                <Knob
                  label="Cutoff"
                  min={20}
                  max={20000}
                  step={1}
                  value={cutoff}
                  unit="Hz"
                  onChange={setCutoff}
                />
                <Knob
                  label="Resonance"
                  min={0}
                  max={1}
                  step={0.01}
                  value={resonance}
                  onChange={setResonance}
                />
                <Knob
                  label="Env Amt"
                  min={0}
                  max={1}
                  step={0.01}
                  value={envAmount}
                  onChange={setEnvAmount}
                />
              </div>

              <div className="grid gap-[var(--ui-space-6)] md:grid-cols-[1fr_auto]">
                <div className="space-y-[var(--ui-space-4)]">
                  <Slider
                    label="Noise"
                    min={0}
                    max={1}
                    step={0.01}
                    value={noise}
                    onChange={setNoise}
                  />
                  <Slider
                    label="Sub"
                    min={0}
                    max={1}
                    step={0.01}
                    value={sub}
                    onChange={setSub}
                  />
                </div>
                <div className="flex flex-col items-center gap-[var(--ui-space-4)]">
                  <Slider
                    label="Output"
                    orientation="vertical"
                    height="12rem"
                    thickness="sm"
                    value={master}
                    onChange={setMaster}
                  />
                  <Meter
                    label="Level"
                    orientation="vertical"
                    width="1.25rem"
                    height="10rem"
                    value={master}
                    min={0}
                    max={1}
                    showPeak
                    peakFps={24}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-[var(--ui-radius-2)] border border-white/10 bg-zinc-950/70 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
            <span>Synth Debug State</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">
                Poll
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={100}
                  value={pollIntervalMs}
                  onChange={(e) =>
                    setPollIntervalMs(
                      Math.min(
                        5000,
                        Math.max(100, Number(e.currentTarget.value) || 750),
                      ),
                    )
                  }
                  className="w-16 rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                />
                ms
              </label>
              <button
                type="button"
                className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
                onClick={() => setDebugPaused((prev) => !prev)}
              >
                {debugPaused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
                onClick={async () => {
                  try {
                    const state = await getSynthState();
                    setDebugState(JSON.stringify(state, null, 2));
                  } catch {
                    setDebugState("{\"error\":\"failed to fetch synth state\"}");
                  }
                }}
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="mb-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">
            {isFocused ? "Focused" : "Paused (blurred)"}
          </div>
          <pre className="max-h-64 overflow-auto rounded-[var(--ui-radius-1)] bg-black/40 p-3 text-[0.65rem] text-zinc-300">
            {debugState}
          </pre>
        </section>
      </div>
    </main>
  );
}

export default App;
