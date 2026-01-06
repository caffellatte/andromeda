mod audio;
mod automation;
mod render;
mod synth;

use audio::{audio_is_running, audio_start, audio_stop, AudioEngine};
use render::render_sample;
use synth::{synth_get_state, synth_reset, synth_set_state, SynthEngine};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SynthEngine::default())
        .manage(AudioEngine::default())
        .invoke_handler(tauri::generate_handler![
            synth_get_state,
            synth_set_state,
            synth_reset,
            audio_start,
            audio_stop,
            audio_is_running,
            render_sample
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
