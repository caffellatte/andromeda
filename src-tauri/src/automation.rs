use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::synth::SynthState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationEvent {
    pub time_ms: u64,
    pub path: String,
    pub value: Value,
    pub curve: Option<String>,
}

pub fn apply_event(state: &mut SynthState, event: &AutomationEvent) {
    let path = event.path.as_str();
    match path {
        "oscillator.waveform" => {
            if let Some(value) = event.value.as_str() {
                state.oscillator.waveform = value.to_string();
            }
        }
        "oscillator.tune" => apply_f32(&event.value, &mut state.oscillator.tune),
        "oscillator.level" => apply_f32(&event.value, &mut state.oscillator.level),
        "oscillator.sync" => apply_bool(&event.value, &mut state.oscillator.sync),
        "filter.cutoff" => apply_f32(&event.value, &mut state.filter.cutoff),
        "filter.resonance" => apply_f32(&event.value, &mut state.filter.resonance),
        "filter.env_amount" => apply_f32(&event.value, &mut state.filter.env_amount),
        "filter.drive" => apply_f32(&event.value, &mut state.filter.drive),
        "mixer.noise" => apply_f32(&event.value, &mut state.mixer.noise),
        "mixer.sub" => apply_f32(&event.value, &mut state.mixer.sub),
        "mixer.master" => apply_f32(&event.value, &mut state.mixer.master),
        "global.mono" => apply_bool(&event.value, &mut state.global.mono),
        "global.glide" => apply_f32(&event.value, &mut state.global.glide),
        "global.clip_amount" => apply_f32(&event.value, &mut state.global.clip_amount),
        _ => {}
    }
}

fn apply_f32(value: &Value, target: &mut f32) {
    if let Some(v) = value.as_f64() {
        *target = v as f32;
    }
}

fn apply_bool(value: &Value, target: &mut bool) {
    if let Some(v) = value.as_bool() {
        *target = v;
    }
}
