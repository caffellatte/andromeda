use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Sample, SampleFormat, Stream};
use std::f32::consts::PI;
use std::sync::{Arc, Mutex};
use tauri::State;

use crate::synth::SynthEngine;

pub struct AudioEngine {
    stream: Mutex<Option<Stream>>,
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self {
            stream: Mutex::new(None),
        }
    }
}

fn build_stream() -> Result<Stream, String> {
    let host = cpal::default_host();
    let device = host
        .default_output_device()
        .ok_or_else(|| "no default output device".to_string())?;
    let config = device
        .default_output_config()
        .map_err(|e| format!("output config error: {e}"))?;
    let stream_config: cpal::StreamConfig = config.clone().into();
    let sample_rate = stream_config.sample_rate as f32;
    let channels = stream_config.channels as usize;
    let err_fn = |err| eprintln!("audio stream error: {err}");
    let amplitude = 0.25;

    let stream = match config.sample_format() {
        SampleFormat::F32 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [f32], _| {
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + 0.0 / sample_rate) % 1.0;
                            let value = (phase * 2.0 * PI).sin() * amplitude;
                            for sample in frame.iter_mut() {
                                *sample = value;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        SampleFormat::I16 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [i16], _| {
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + 0.0 / sample_rate) % 1.0;
                            let value = (phase * 2.0 * PI).sin() * amplitude;
                            let sample = i16::from_sample(value);
                            for out in frame.iter_mut() {
                                *out = sample;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        SampleFormat::U16 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [u16], _| {
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + 0.0 / sample_rate) % 1.0;
                            let value = (phase * 2.0 * PI).sin() * amplitude;
                            let sample = u16::from_sample(value);
                            for out in frame.iter_mut() {
                                *out = sample;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        _ => return Err("unsupported sample format".to_string()),
    };

    Ok(stream)
}

fn build_stream_with_state(state: Arc<Mutex<crate::synth::SynthState>>) -> Result<Stream, String> {
    let host = cpal::default_host();
    let device = host
        .default_output_device()
        .ok_or_else(|| "no default output device".to_string())?;
    let config = device
        .default_output_config()
        .map_err(|e| format!("output config error: {e}"))?;
    let stream_config: cpal::StreamConfig = config.clone().into();
    let sample_rate = stream_config.sample_rate as f32;
    let channels = stream_config.channels as usize;
    let err_fn = |err| eprintln!("audio stream error: {err}");

    let stream = match config.sample_format() {
        SampleFormat::F32 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            let state = state.clone();
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [f32], _| {
                        let (freq, waveform, level) = {
                            let guard = state
                                .lock()
                                .map(|s| {
                                    let freq = 220.0 * 2.0f32.powf(s.oscillator.tune / 12.0);
                                    let waveform = s.oscillator.waveform.clone();
                                    let level = s.oscillator.level.max(0.0).min(1.0);
                                    (freq, waveform, level)
                                })
                                .unwrap_or((220.0, "sine".into(), 0.2));
                            guard
                        };
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + freq / sample_rate) % 1.0;
                            let value = wave_value(&waveform, phase) * level;
                            for sample in frame.iter_mut() {
                                *sample = value;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        SampleFormat::I16 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            let state = state.clone();
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [i16], _| {
                        let (freq, waveform, level) = {
                            let guard = state
                                .lock()
                                .map(|s| {
                                    let freq = 220.0 * 2.0f32.powf(s.oscillator.tune / 12.0);
                                    let waveform = s.oscillator.waveform.clone();
                                    let level = s.oscillator.level.max(0.0).min(1.0);
                                    (freq, waveform, level)
                                })
                                .unwrap_or((220.0, "sine".into(), 0.2));
                            guard
                        };
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + freq / sample_rate) % 1.0;
                            let value = wave_value(&waveform, phase) * level;
                            let sample = i16::from_sample(value);
                            for out in frame.iter_mut() {
                                *out = sample;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        SampleFormat::U16 => {
            let cfg = stream_config.clone();
            let mut phase = 0.0f32;
            let state = state.clone();
            device
                .build_output_stream(
                    &cfg,
                    move |data: &mut [u16], _| {
                        let (freq, waveform, level) = {
                            let guard = state
                                .lock()
                                .map(|s| {
                                    let freq = 220.0 * 2.0f32.powf(s.oscillator.tune / 12.0);
                                    let waveform = s.oscillator.waveform.clone();
                                    let level = s.oscillator.level.max(0.0).min(1.0);
                                    (freq, waveform, level)
                                })
                                .unwrap_or((220.0, "sine".into(), 0.2));
                            guard
                        };
                        for frame in data.chunks_mut(channels) {
                            phase = (phase + freq / sample_rate) % 1.0;
                            let value = wave_value(&waveform, phase) * level;
                            let sample = u16::from_sample(value);
                            for out in frame.iter_mut() {
                                *out = sample;
                            }
                        }
                    },
                    err_fn,
                    None,
                )
                .map_err(|e| format!("stream build error: {e}"))?
        }
        _ => return Err("unsupported sample format".to_string()),
    };

    Ok(stream)
}

fn wave_value(waveform: &str, phase: f32) -> f32 {
    match waveform {
        "square" => {
            if phase < 0.5 {
                1.0
            } else {
                -1.0
            }
        }
        "saw" => 2.0 * phase - 1.0,
        "triangle" => 1.0 - 4.0 * (phase - 0.5).abs(),
        _ => (phase * 2.0 * PI).sin(),
    }
}

#[tauri::command]
pub fn audio_start(state: State<AudioEngine>, synth: State<SynthEngine>) -> Result<bool, String> {
    let mut guard = state
        .stream
        .lock()
        .map_err(|_| "audio state lock poisoned".to_string())?;
    if guard.is_some() {
        return Ok(false);
    }
    let stream = build_stream_with_state(synth.state.clone())?;
    stream
        .play()
        .map_err(|e| format!("audio start failed: {e}"))?;
    *guard = Some(stream);
    Ok(true)
}

#[tauri::command]
pub fn audio_stop(state: State<AudioEngine>) -> Result<bool, String> {
    let mut guard = state
        .stream
        .lock()
        .map_err(|_| "audio state lock poisoned".to_string())?;
    let was_running = guard.take().is_some();
    Ok(was_running)
}

#[tauri::command]
pub fn audio_is_running(state: State<AudioEngine>) -> Result<bool, String> {
    let guard = state
        .stream
        .lock()
        .map_err(|_| "audio state lock poisoned".to_string())?;
    Ok(guard.is_some())
}
