import { invoke } from "@tauri-apps/api/core";

export type EnvelopeState = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type OscillatorState = {
  waveform: string;
  tune: number;
  level: number;
  sync: boolean;
};

export type FilterState = {
  cutoff: number;
  resonance: number;
  env_amount: number;
  drive: number;
};

export type MixerState = {
  noise: number;
  sub: number;
  master: number;
};

export type GlobalState = {
  mono: boolean;
  glide: number;
  clip_amount: number;
};

export type SynthState = {
  envelope: EnvelopeState;
  oscillator: OscillatorState;
  filter: FilterState;
  mixer: MixerState;
  global: GlobalState;
};

export type AutomationEvent = {
  time_ms: number;
  path: string;
  value: number | string | boolean;
  curve?: "step" | "linear";
};

export type RenderRequest = {
  duration_ms: number;
  sample_rate: number;
  events: AutomationEvent[];
};

export type Keyframe = {
  time_ms: number;
  value: number | string | boolean;
  curve?: "step" | "linear";
};

export type AutomationTrack = {
  path: string;
  keyframes: Keyframe[];
};

export type Timeline = {
  duration_ms: number;
  tracks: AutomationTrack[];
};

export const flattenTimeline = (timeline: Timeline): AutomationEvent[] => {
  return timeline.tracks
    .flatMap((track) =>
      track.keyframes.map((keyframe) => ({
        time_ms: keyframe.time_ms,
        path: track.path,
        value: keyframe.value,
        curve: keyframe.curve,
      })),
    )
    .sort((a, b) => a.time_ms - b.time_ms);
};

export const getSynthState = () => invoke<SynthState>("synth_get_state");

export const setSynthState = (state: SynthState) =>
  invoke("synth_set_state", { next: state });

export const resetSynthState = () => invoke<SynthState>("synth_reset");

export const startAudio = () => invoke<boolean>("audio_start");

export const stopAudio = () => invoke<boolean>("audio_stop");

export const isAudioRunning = () => invoke<boolean>("audio_is_running");

export const renderSample = (request: RenderRequest) =>
  invoke<string>("render_sample", { request });
