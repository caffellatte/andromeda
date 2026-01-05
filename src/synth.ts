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
};

export type SynthState = {
  envelope: EnvelopeState;
  oscillator: OscillatorState;
  filter: FilterState;
  mixer: MixerState;
  global: GlobalState;
};

export const getSynthState = () => invoke<SynthState>("synth_get_state");

export const setSynthState = (state: SynthState) =>
  invoke("synth_set_state", { next: state });

export const resetSynthState = () => invoke<SynthState>("synth_reset");
