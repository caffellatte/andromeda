use crate::automation::{apply_event, AutomationEvent};
use crate::synth::SynthEngine;
use hound::{SampleFormat, WavSpec, WavWriter};
use std::f32::consts::PI;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RenderRequest {
    pub duration_ms: u64,
    pub sample_rate: u32,
    pub events: Vec<AutomationEvent>,
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

fn soft_clip(x: f32) -> f32 {
    x / (1.0 + x.abs())
}

#[tauri::command]
pub fn render_sample(request: RenderRequest, synth: State<SynthEngine>) -> Result<String, String> {
    let mut events = request.events.clone();
    events.sort_by_key(|e| e.time_ms);

    let mut state = synth
        .state
        .lock()
        .map(|guard| guard.clone())
        .map_err(|_| "synth state lock poisoned".to_string())?;

    let total_samples = (request.duration_ms as f64 * request.sample_rate as f64 / 1000.0) as u64;
    let spec = WavSpec {
        channels: 1,
        sample_rate: request.sample_rate,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };

    let mut path = dirs::desktop_dir().ok_or("desktop directory not found")?;
    path.push("Andromeda Samples");
    std::fs::create_dir_all(&path)
        .map_err(|e| format!("failed to create output directory: {e}"))?;
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "system time before unix epoch".to_string())?
        .as_millis();
    let filename = format!("andromeda-render-{millis}.wav");
    path.push(filename);

    let mut writer = WavWriter::create(&path, spec)
        .map_err(|e| format!("wav writer error: {e}"))?;

    let mut phase = 0.0f32;
    let mut z = 0.0f32;
    let mut event_index = 0usize;

    for i in 0..total_samples {
        let t_ms = (i as f64 * 1000.0 / request.sample_rate as f64) as u64;
        while event_index < events.len() && events[event_index].time_ms <= t_ms {
            apply_event(&mut state, &events[event_index]);
            event_index += 1;
        }

        let freq = 220.0 * 2.0f32.powf(state.oscillator.tune / 12.0);
        let waveform = state.oscillator.waveform.as_str();
        let level = state.oscillator.level.max(0.0).min(1.0);
        let master = state.mixer.master.max(0.0).min(1.0);
        let cutoff = state.filter.cutoff.max(20.0).min(20000.0);
        let resonance = state.filter.resonance.max(0.0).min(1.0);
        let clip_amount = state.global.clip_amount.max(0.05).min(1.0);

        phase = (phase + freq / request.sample_rate as f32) % 1.0;
        let raw = wave_value(waveform, phase) * level;
        let a = (-2.0 * PI * cutoff / request.sample_rate as f32).exp();
        let feedback = (1.0 + resonance * 3.0).min(3.5);
        let input = raw - z * (feedback - 1.0);
        z = (1.0 - a) * input + a * z;
        let sample = soft_clip(z * master * clip_amount);
        let out = (sample * i16::MAX as f32) as i16;
        writer
            .write_sample(out)
            .map_err(|e| format!("wav write error: {e}"))?;
    }

    writer.finalize().map_err(|e| format!("wav finalize error: {e}"))?;

    Ok(path.to_string_lossy().to_string())
}
