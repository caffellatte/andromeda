use crate::automation::AutomationEvent;
use dotenvy::dotenv;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AiGenerateRequest {
    pub prompt: String,
    pub duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatCompletionRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatCompletionResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatChoice {
    message: ChatMessage,
}

#[tauri::command]
pub async fn ai_generate_automation(
    request: AiGenerateRequest,
) -> Result<Vec<AutomationEvent>, String> {
    dotenv().ok();
    let api_key = std::env::var("OPENAI_API_KEY")
        .map_err(|_| "OPENAI_API_KEY not set".to_string())?;
    let model = std::env::var("OPENAI_MODEL").unwrap_or_else(|_| "gpt-4o-mini".to_string());

    let system = r#"You generate automation events for a synth. Return only a JSON array of events.
Each event: {"time_ms": number, "path": string, "value": number|string|boolean, "curve": "step"|"linear"}.
Valid paths:
- oscillator.waveform (string: sine|triangle|saw|square)
- oscillator.tune (number)
- oscillator.level (number 0..1)
- oscillator.sync (boolean)
- filter.cutoff (number 20..20000)
- filter.resonance (number 0..1)
- filter.env_amount (number 0..1)
- filter.drive (number 0..1)
- mixer.noise (number 0..1)
- mixer.sub (number 0..1)
- mixer.master (number 0..1)
- global.mono (boolean)
- global.glide (number 0..1)
- global.clip_amount (number 0.05..1)
No extra text, no markdown, JSON only."#;

    let user = format!(
        "Duration: {} ms. Prompt: {}",
        request.duration_ms, request.prompt
    );

    let payload = ChatCompletionRequest {
        model,
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: system.to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user,
            },
        ],
        temperature: 0.3,
    };

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("openai request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "unknown error".to_string());
        return Err(format!("openai error: {status} - {body}"));
    }

    let parsed: ChatCompletionResponse = response
        .json()
        .await
        .map_err(|e| format!("openai response parse failed: {e}"))?;
    let content = parsed
        .choices
        .get(0)
        .map(|c| c.message.content.clone())
        .unwrap_or_default();

    let events: Vec<AutomationEvent> = serde_json::from_str(&content)
        .map_err(|e| format!("automation json parse failed: {e}"))?;

    Ok(events)
}
