import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Knob, Slider } from "./ui";
import "./App.css";
import { Envelope } from "./ui";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <Knob
        label="Cutoff"
        min={20}
        max={20000}
        step={1}
        unit="Hz"
        defaultValue={440}
      />
      <Slider thickness="lg" trackHeight="sm" thumbSize="lg" label="Mix" />
      <Slider orientation="vertical" height="12rem" thickness="sm" />

      <Envelope
        timeMax={5}
        sustainMax={1}
        defaultAttack={0.02}
        defaultDecay={0.2}
        defaultSustain={0.8}
        defaultRelease={0.4}
        onChange={(values) => console.log(values)}
      />
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
