use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    pub attack: f32,
    pub decay: f32,
    pub sustain: f32,
    pub release: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Oscillator {
    pub waveform: String,
    pub tune: f32,
    pub level: f32,
    pub sync: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Filter {
    pub cutoff: f32,
    pub resonance: f32,
    pub env_amount: f32,
    pub drive: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mixer {
    pub noise: f32,
    pub sub: f32,
    pub master: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Global {
    pub mono: bool,
    pub glide: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthState {
    pub envelope: Envelope,
    pub oscillator: Oscillator,
    pub filter: Filter,
    pub mixer: Mixer,
    pub global: Global,
}

impl Default for SynthState {
    fn default() -> Self {
        Self {
            envelope: Envelope {
                attack: 0.02,
                decay: 0.25,
                sustain: 0.7,
                release: 0.4,
            },
            oscillator: Oscillator {
                waveform: "saw".into(),
                tune: 0.0,
                level: 0.7,
                sync: true,
            },
            filter: Filter {
                cutoff: 1400.0,
                resonance: 0.35,
                env_amount: 0.55,
                drive: 0.2,
            },
            mixer: Mixer {
                noise: 0.12,
                sub: 0.3,
                master: 0.72,
            },
            global: Global {
                mono: false,
                glide: 0.05,
            },
        }
    }
}

pub struct SynthEngine {
    state: Mutex<SynthState>,
}

impl Default for SynthEngine {
    fn default() -> Self {
        Self {
            state: Mutex::new(SynthState::default()),
        }
    }
}

#[tauri::command]
pub fn synth_get_state(state: State<SynthEngine>) -> SynthState {
    state
        .state
        .lock()
        .map(|guard| guard.clone())
        .unwrap_or_else(|_| SynthState::default())
}

#[tauri::command]
pub fn synth_set_state(next: SynthState, state: State<SynthEngine>) -> Result<(), String> {
    state
        .state
        .lock()
        .map_err(|_| "synth state lock poisoned".to_string())?
        .clone_from(&next);
    Ok(())
}

#[tauri::command]
pub fn synth_reset(state: State<SynthEngine>) -> SynthState {
    let default_state = SynthState::default();
    if let Ok(mut guard) = state.state.lock() {
        *guard = default_state.clone();
    }
    default_state
}
