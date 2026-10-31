"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { FileQuestion, ImageOff, TriangleAlert } from "lucide-react";
import { compressImage } from "@/lib/client/compressImage";
import { countryByCode } from "@/lib/client/countries";
import type { AnalysisResult, CountryCode } from "@/lib/types";
import { HotlineList } from "./HotlineList";
import { LoadingView } from "./LoadingView";
import { PhotoCapture } from "./PhotoCapture";
import { ResultView } from "./ResultView";
import { RetryView } from "./RetryView";

// Results live only in this component's state, never in the URL, so a check can't be shared or reopened.
type Step =
  | { name: "photo" }
  | { name: "loading" }
  | { name: "result"; result: AnalysisResult }
  | { name: "error"; message: string };

const RETAKE = {
  unreadable: { icon: ImageOff, title: "We couldn't read this photo" },
  not_work_document: { icon: FileQuestion, title: "This isn't a work contract or payslip" },
} as const;

async function decodeImage(url: string): Promise<void> {
  const image = new Image();
  image.src = url;
  // A photo the browser can't decode still gets checked; compression reports the real error.
  await image.decode().catch(() => undefined);
}

async function analyze(file: File, country: CountryCode): Promise<AnalysisResult> {
  let image: Blob;
  try {
    image = await compressImage(file);
  } catch {
    throw new Error("We couldn't open this photo. Take a new one.");
  }
  const form = new FormData();
  form.set("image", image, "document.jpg");
  form.set("country", country);

  const response = await fetch("/api/analyze", { method: "POST", body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Analysis failed, please try again");
  return body as AnalysisResult;
}

export function CheckFlow({ country }: { country: CountryCode }) {
  const [step, setStep] = useState<Step>({ name: "photo" });
  // The checked photo stays in the browser only, shown while loading and on the result.
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // Bumped when the worker leaves this page, so coming back (the logo, then a country) starts fresh
  // instead of showing the cached previous result.
  const [visit, setVisit] = useState(0);
  const visitRef = useRef(0);
  const option = countryByCode(country);
  const retake = () => setStep({ name: "photo" });

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  useEffect(
    () => () => {
      visitRef.current++;
      setVisit(visitRef.current);
      setStep({ name: "photo" });
      setPhotoUrl(null);
    },
    [],
  );

  // Photo → loading → result run as transitions, so the shared photo (CheckedPhoto) moves and
  // resizes between the screens instead of being replaced.
  async function submit(file: File) {
    const visitAtStart = visitRef.current;
    const url = URL.createObjectURL(file);
    // Decode first: if the loading screen's copy isn't ready when the move starts, the empty box
    // behind it shows through for a moment.
    await decodeImage(url);
    if (visitAtStart !== visitRef.current) return URL.revokeObjectURL(url);
    startTransition(() => {
      setPhotoUrl(url);
      setStep({ name: "loading" });
    });
    try {
      const result = await analyze(file, country);
      if (visitAtStart !== visitRef.current) return;
      startTransition(() => setStep({ name: "result", result }));
    } catch (error) {
      if (visitAtStart !== visitRef.current) return;
      setStep({ name: "error", message: error instanceof Error ? error.message : "Analysis failed, please try again" });
    }
  }

  function content() {
    switch (step.name) {
      case "photo":
        return <PhotoCapture country={option} onSubmit={submit} />;
      case "loading":
        return <LoadingView country={option} photoUrl={photoUrl} />;
      case "error":
        return <RetryView icon={TriangleAlert} title={step.message} buttonLabel="Try again" onRetry={retake} />;
      case "result":
        if (step.result.status === "ok") {
          return (
            <ResultView flags={step.result.flags} hotlines={step.result.hotlines} photoUrl={photoUrl} onRestart={retake} />
          );
        }
        return (
          <RetryView
            icon={RETAKE[step.result.status].icon}
            title={RETAKE[step.result.status].title}
            buttonLabel="Retake photo"
            onRetry={retake}
          >
            <HotlineList hotlines={step.result.hotlines} />
          </RetryView>
        );
    }
  }

  // A new key per step fades the new step in, except loading and results: there the photo
  // moves in on its own (CheckedPhoto), and a fade would nudge where it lands.
  return (
    <div key={`${visit}-${step.name}`} className={step.name === "loading" || step.name === "result" ? undefined : "enter"}>
      {content()}
    </div>
  );
}
