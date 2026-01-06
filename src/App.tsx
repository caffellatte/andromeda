import { useEffect, useState } from "react";
import {
  Envelope,
  Knob,
  Meter,
  Oscillator,
  Slider,
  Toggle,
} from "./ui";
import {
  flattenTimeline,
  getSynthState,
  isAudioRunning,
  renderSample,
  setSynthState,
  startAudio,
  stopAudio,
  type Timeline,
} from "./synth";
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
  const [clipAmount, setClipAmount] = useState(0.35);
  const [osc, setOsc] = useState({
    waveform: "saw",
    tune: 0,
    level: 0.7,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Timeline>({
    duration_ms: 3000,
    tracks: [
      {
        path: "filter.cutoff",
        keyframes: [
          { time_ms: 0, value: 400, curve: "linear" },
          { time_ms: 3000, value: 12000, curve: "linear" },
        ],
      },
    ],
  });
  const [renderPath, setRenderPath] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [timelineJson, setTimelineJson] = useState<string>("");
  const [timelineStatus, setTimelineStatus] = useState<string | null>(null);
  const waveformPath = "oscillator.waveform";
  const booleanPaths = new Set(["oscillator.sync", "global.mono"]);
  const parameterOptions = [
    "filter.cutoff",
    "filter.resonance",
    "mixer.master",
    "oscillator.waveform",
    "oscillator.tune",
    "oscillator.level",
    "oscillator.sync",
    "global.mono",
    "global.clip_amount",
  ];
  const getDefaultValue = (path: string) => {
    if (path === waveformPath) return "sine";
    if (booleanPaths.has(path)) return false;
    return 0;
  };
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
        clip_amount: clipAmount,
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
    clipAmount,
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
    const fetchAudioState = async () => {
      try {
        const running = await isAudioRunning();
        if (active) {
          setIsPlaying(running);
        }
      } catch {
        if (active) {
          setAudioError("Failed to read audio state.");
        }
      }
    };
    void fetchAudioState();
    return () => {
      active = false;
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
                <Toggle
                  label="Play"
                  checked={isPlaying}
                  onChange={async (next) => {
                    setAudioError(null);
                    if (next) {
                      try {
                        const started = await startAudio();
                        if (!started) {
                          setAudioError("Audio already running.");
                        }
                        setIsPlaying(started ? next : false);
                        return;
                      } catch {
                        setAudioError("Audio start failed.");
                        setIsPlaying(false);
                        return;
                      }
                    }
                    try {
                      await stopAudio();
                    } catch {
                      setAudioError("Audio stop failed.");
                    }
                    setIsPlaying(false);
                  }}
                />
                <div className="flex items-center text-xs text-amber-200/80">
                  {audioError ?? ""}
                </div>
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
                <div className="rounded-[var(--ui-radius-2)] border border-white/10 bg-zinc-950/60 p-[var(--ui-space-4)]">
                  <div className="mb-[var(--ui-space-3)] text-[0.6rem] uppercase tracking-[0.3em] text-zinc-500">
                    Master
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
                    <Knob
                      label="Clip"
                      min={0.05}
                      max={1}
                      step={0.01}
                      value={clipAmount}
                      onChange={setClipAmount}
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
        <section className="rounded-[var(--ui-radius-2)] border border-white/10 bg-zinc-950/70 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
            Automation Timeline
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
            <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">
              Duration
              <input
                type="number"
                min={500}
                max={20000}
                step={100}
                value={timeline.duration_ms}
                onChange={(e) =>
                  setTimeline((prev) => ({
                    ...prev,
                    duration_ms: Math.min(
                      20000,
                      Math.max(500, Number(e.currentTarget.value) || 3000),
                    ),
                  }))
                }
                className="w-20 rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
              />
              ms
            </label>
            <button
              type="button"
              className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
              onClick={async () => {
                setRenderError(null);
                setRenderPath(null);
                try {
                  const events = flattenTimeline(timeline);
                  const path = await renderSample({
                    duration_ms: timeline.duration_ms,
                    sample_rate: 44100,
                    events,
                  });
                  setRenderPath(path);
                } catch {
                  setRenderError("Render failed.");
                }
              }}
            >
              Render Sample
            </button>
            <button
              type="button"
              className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
              onClick={() =>
                setTimeline((prev) => ({
                  ...prev,
                  tracks: [
                    ...prev.tracks,
                    { path: parameterOptions[0], keyframes: [] },
                  ],
                }))
              }
            >
              Add Track
            </button>
            {renderPath ? (
              <span className="text-[0.6rem] text-amber-200/80">
                {renderPath}
              </span>
            ) : null}
            {renderError ? (
              <span className="text-[0.6rem] text-red-300/80">
                {renderError}
              </span>
            ) : null}
          </div>
          <div className="space-y-3">
            {timeline.tracks.map((track, trackIndex) => (
              <div
                key={track.path}
                className="rounded-[var(--ui-radius-1)] border border-white/5 bg-zinc-900/40 p-3"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-400">
                  <label className="flex items-center gap-2">
                    Path
                    <select
                      value={track.path}
                      onChange={(e) =>
                        setTimeline((prev) => {
                          const next = { ...prev };
                          const nextTracks = [...next.tracks];
                          const nextTrack = { ...nextTracks[trackIndex] };
                          const nextPath = e.currentTarget.value;
                          nextTrack.path = nextPath;
                          nextTrack.keyframes = nextTrack.keyframes.map(
                            (keyframe) => ({
                              ...keyframe,
                              value: getDefaultValue(nextPath),
                            }),
                          );
                          nextTracks[trackIndex] = nextTrack;
                          next.tracks = nextTracks;
                          return next;
                        })
                      }
                      className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                    >
                      {parameterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
                    onClick={() =>
                      setTimeline((prev) => {
                        const next = { ...prev };
                        const nextTracks = [...next.tracks];
                        const nextTrack = { ...nextTracks[trackIndex] };
                        const nextKeyframes = [...nextTrack.keyframes];
                        nextKeyframes.push({
                          time_ms: Math.min(prev.duration_ms, 1000),
                          value: getDefaultValue(nextTrack.path),
                          curve: "linear",
                        });
                        nextTrack.keyframes = nextKeyframes;
                        nextTracks[trackIndex] = nextTrack;
                        next.tracks = nextTracks;
                        return next;
                      })
                    }
                  >
                    Add Keyframe
                  </button>
                  <button
                    type="button"
                    className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-red-200"
                    onClick={() =>
                      setTimeline((prev) => ({
                        ...prev,
                        tracks: prev.tracks.filter(
                          (_, index) => index !== trackIndex,
                        ),
                      }))
                    }
                  >
                    Remove Track
                  </button>
                </div>
                <div className="space-y-2">
                  {track.keyframes.map((keyframe, keyIndex) => (
                    <div
                      key={`${track.path}-${keyIndex}`}
                      className="grid gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <label className="flex items-center gap-2">
                        Time
                        <input
                          type="number"
                          min={0}
                          max={timeline.duration_ms}
                          step={50}
                          value={keyframe.time_ms}
                          onChange={(e) =>
                            setTimeline((prev) => {
                              const next = { ...prev };
                              const nextTracks = [...next.tracks];
                              const nextTrack = { ...nextTracks[trackIndex] };
                              const nextKeyframes = [...nextTrack.keyframes];
                              const nextKeyframe = { ...nextKeyframes[keyIndex] };
                              nextKeyframe.time_ms = Math.min(
                                prev.duration_ms,
                                Math.max(0, Number(e.currentTarget.value) || 0),
                              );
                              nextKeyframes[keyIndex] = nextKeyframe;
                              nextTrack.keyframes = nextKeyframes;
                              nextTracks[trackIndex] = nextTrack;
                              next.tracks = nextTracks;
                              return next;
                            })
                          }
                          className="w-20 rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                        />
                      </label>
                      {track.path === waveformPath ? (
                        <label className="flex items-center gap-2">
                          Value
                          <select
                            value={
                              typeof keyframe.value === "string"
                                ? keyframe.value
                                : "sine"
                            }
                            onChange={(e) =>
                              setTimeline((prev) => {
                                const next = { ...prev };
                                const nextTracks = [...next.tracks];
                                const nextTrack = { ...nextTracks[trackIndex] };
                                const nextKeyframes = [...nextTrack.keyframes];
                                const nextKeyframe = {
                                  ...nextKeyframes[keyIndex],
                                };
                                nextKeyframe.value = e.currentTarget.value;
                                nextKeyframes[keyIndex] = nextKeyframe;
                                nextTrack.keyframes = nextKeyframes;
                                nextTracks[trackIndex] = nextTrack;
                                next.tracks = nextTracks;
                                return next;
                              })
                            }
                            className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                          >
                            <option value="sine">sine</option>
                            <option value="triangle">triangle</option>
                            <option value="saw">saw</option>
                            <option value="square">square</option>
                          </select>
                        </label>
                      ) : booleanPaths.has(track.path) ? (
                        <label className="flex items-center gap-2">
                          Value
                          <select
                            value={keyframe.value ? "true" : "false"}
                            onChange={(e) =>
                              setTimeline((prev) => {
                                const next = { ...prev };
                                const nextTracks = [...next.tracks];
                                const nextTrack = { ...nextTracks[trackIndex] };
                                const nextKeyframes = [...nextTrack.keyframes];
                                const nextKeyframe = {
                                  ...nextKeyframes[keyIndex],
                                };
                                nextKeyframe.value =
                                  e.currentTarget.value === "true";
                                nextKeyframes[keyIndex] = nextKeyframe;
                                nextTrack.keyframes = nextKeyframes;
                                nextTracks[trackIndex] = nextTrack;
                                next.tracks = nextTracks;
                                return next;
                              })
                            }
                            className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        </label>
                      ) : (
                        <label className="flex items-center gap-2">
                          Value
                          <input
                            type="number"
                            step={1}
                            value={
                              typeof keyframe.value === "number"
                                ? keyframe.value
                                : 0
                            }
                            onChange={(e) =>
                              setTimeline((prev) => {
                                const next = { ...prev };
                                const nextTracks = [...next.tracks];
                                const nextTrack = { ...nextTracks[trackIndex] };
                                const nextKeyframes = [...nextTrack.keyframes];
                                const nextKeyframe = {
                                  ...nextKeyframes[keyIndex],
                                };
                                nextKeyframe.value = Number(
                                  e.currentTarget.value,
                                );
                                nextKeyframes[keyIndex] = nextKeyframe;
                                nextTrack.keyframes = nextKeyframes;
                                nextTracks[trackIndex] = nextTrack;
                                next.tracks = nextTracks;
                                return next;
                              })
                            }
                            className="w-24 rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                          />
                        </label>
                      )}
                      <label className="flex items-center gap-2">
                        Curve
                        <select
                          value={keyframe.curve ?? "step"}
                          onChange={(e) =>
                            setTimeline((prev) => {
                              const next = { ...prev };
                              const nextTracks = [...next.tracks];
                              const nextTrack = { ...nextTracks[trackIndex] };
                              const nextKeyframes = [...nextTrack.keyframes];
                              const nextKeyframe = { ...nextKeyframes[keyIndex] };
                              nextKeyframe.curve = e.currentTarget
                                .value as "step" | "linear";
                              nextKeyframes[keyIndex] = nextKeyframe;
                              nextTrack.keyframes = nextKeyframes;
                              nextTracks[trackIndex] = nextTrack;
                              next.tracks = nextTracks;
                              return next;
                            })
                          }
                          className="w-24 rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-200"
                        >
                          <option value="step">Step</option>
                          <option value="linear">Linear</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-red-200"
                        onClick={() =>
                          setTimeline((prev) => {
                            const next = { ...prev };
                            const nextTracks = [...next.tracks];
                            const nextTrack = { ...nextTracks[trackIndex] };
                            const nextKeyframes = nextTrack.keyframes.filter(
                              (_, index) => index !== keyIndex,
                            );
                            nextTrack.keyframes = nextKeyframes;
                            nextTracks[trackIndex] = nextTrack;
                            next.tracks = nextTracks;
                            return next;
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <textarea
              rows={4}
              value={timelineJson}
              onChange={(e) => setTimelineJson(e.currentTarget.value)}
              placeholder="Paste timeline JSON to load or export current timeline."
              className="w-full rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/70 p-3 text-[0.6rem] text-zinc-200"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-3 py-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
                onClick={() => {
                  setTimelineJson(JSON.stringify(timeline, null, 2));
                  setTimelineStatus("Timeline exported to JSON.");
                }}
              >
                Export JSON
              </button>
              <button
                type="button"
                className="rounded-[var(--ui-radius-1)] border border-white/10 bg-zinc-900/80 px-3 py-2 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 transition hover:text-amber-100"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(timelineJson) as Timeline;
                    if (!parsed || !Array.isArray(parsed.tracks)) {
                      throw new Error("Invalid timeline.");
                    }
                    setTimeline(parsed);
                    setTimelineStatus("Timeline loaded.");
                  } catch {
                    setTimelineStatus("Invalid JSON.");
                  }
                }}
              >
                Load JSON
              </button>
              {timelineStatus ? (
                <span className="text-[0.6rem] text-zinc-500">
                  {timelineStatus}
                </span>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
