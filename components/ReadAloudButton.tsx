"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Square, Volume2 } from "lucide-react";

const noSubscription = () => () => {};

// Browsers don't tag voices by gender, so match well-known female English voices by name
// (Windows, macOS/iOS, Android/Chrome, Edge). Falls back to the browser default.
const FEMALE_VOICE = /female|zira|aria|jenny|hazel|susan|samantha|victoria|karen|moira|tessa|serena|libby|sonia|natasha|google uk english female|google us english/i;

function pickFemaleVoice(): SpeechSynthesisVoice | undefined {
  const english = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  return english.find((v) => FEMALE_VOICE.test(v.name));
}

// A quiet grey round button that reads the card aloud in a female voice.
export function ReadAloudButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  // False during server render, real value in the browser, without a hydration mismatch.
  const supported = useSyncExternalStore(noSubscription, () => "speechSynthesis" in window, () => false);

  useEffect(() => {
    // Voices load asynchronously in some browsers; asking once early makes them ready by the first tap.
    window.speechSynthesis?.getVoices();
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!supported) return null;

  function toggle() {
    window.speechSynthesis.cancel();
    if (speaking) return setSpeaking(false);
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickFemaleVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? "Stop reading" : "Read aloud"}
      title={speaking ? "Stop reading" : "Read aloud"}
      className="pressable grid size-10 shrink-0 place-items-center rounded-full bg-ink/8 text-ink-soft hover:bg-ink/12 hover:text-ink"
    >
      {speaking ? <Square aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-5" />}
    </button>
  );
}
