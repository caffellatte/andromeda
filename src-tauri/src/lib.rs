mod synth;

use synth::{synth_get_state, synth_reset, synth_set_state, SynthEngine};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SynthEngine::default())
        .invoke_handler(tauri::generate_handler![
            synth_get_state,
            synth_set_state,
            synth_reset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
