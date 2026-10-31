"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Camera, Images, RotateCcw, ScanText, type LucideIcon } from "lucide-react";
import type { CountryOption } from "@/lib/client/countries";
import { AnimatedHeight } from "./AnimatedHeight";
import { CheckedPhoto } from "./CheckedPhoto";
import { CountryChip } from "./CountryChip";
import { InlineCamera, cameraSupported } from "./InlineCamera";

interface Props {
  country: CountryOption;
  onSubmit: (file: File) => void;
}

interface SourceTileProps {
  icon: LucideIcon;
  label: string;
  accent: string;
  highlighted: boolean;
  onClick: () => void;
}

// One big square choice: where the photo comes from.
function SourceTile({ icon: Icon, label, accent, highlighted, onClick }: SourceTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pressable group flex aspect-square flex-col items-center justify-center gap-4 rounded-3xl text-xl font-bold shadow-sm ring-1 ${
        highlighted ? "bg-accent/10 ring-2 ring-accent" : "bg-paper ring-ink/10"
      }`}
    >
      <span
        className={`grid size-20 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${accent}`}
      >
        <Icon aria-hidden className="size-9" />
      </span>
      {label}
    </button>
  );
}

export function PhotoCapture({ country, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  // Where the photo came from decides the retry label: the camera app or a file/drop.
  const [source, setSource] = useState<"camera" | "file">("file");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Phones and tablets: the system camera app is the better camera. Computers: live preview in the page,
  // falling back to the device's picker where the browser can't open the camera.
  function openCamera() {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch && cameraSupported()) setCameraOn(true);
    else cameraInput.current?.click();
  }

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function choose(chosen: File | null, from: "camera" | "file" = "file") {
    setCameraOn(false);
    setFile(chosen);
    setSource(from);
    setPreview(chosen ? URL.createObjectURL(chosen) : null);
  }

  const view = preview && file ? "photo" : cameraOn ? "camera" : "choose";

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = [...event.dataTransfer.files].find((f) => f.type.startsWith("image/"));
    if (dropped) choose(dropped);
  }

  return (
    <section aria-labelledby="photo-heading" className="mx-auto w-full max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <CountryChip country={country} />
        <h1 id="photo-heading" className="text-2xl font-bold leading-tight">
          Photo of your contract
        </h1>
      </div>

      {/* The area resizes smoothly to fit the current view; the new view fades in as it does. */}
      <div className="mt-6">
        <AnimatedHeight>
          <div key={view} className="enter-soft">
          {preview && file ? (
            <div>
              <CheckedPhoto src={preview} alt="Your photo" className="mx-auto block h-auto max-h-[28rem] w-auto max-w-full" />
              <button
                type="button"
                onClick={() => onSubmit(file)}
                className="pressable mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-accent px-5 text-xl font-bold text-paper"
              >
                <ScanText aria-hidden className="size-6" />
                Check my contract
              </button>
              <button
                type="button"
                onClick={() => choose(null)}
                className="pressable mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-paper px-5 text-lg font-bold shadow-sm ring-1 ring-ink/10"
              >
                <RotateCcw aria-hidden className="size-5" />
                {source === "camera" ? "Take another photo" : "Choose another photo"}
              </button>
            </div>
          ) : cameraOn ? (
            <InlineCamera
              onCancel={() => setCameraOn(false)}
              onFallback={() => {
                setCameraOn(false);
                cameraInput.current?.click();
              }}
              onSubmit={onSubmit}
            />
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={drop}
            >
              <div className="grid grid-cols-2 gap-3">
                <SourceTile icon={Camera} label="Camera" accent="bg-accent text-paper" highlighted={dragging} onClick={openCamera} />
                <SourceTile
                  icon={Images}
                  label="Files"
                  accent="bg-ink text-paper"
                  highlighted={dragging}
                  onClick={() => fileInput.current?.click()}
                />
              </div>
              {dragging && <p className="enter mt-3 text-center text-base font-bold text-accent">Drop photo here</p>}
            </div>
          )}
          </div>
        </AnimatedHeight>
      </div>

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          choose(e.target.files?.[0] ?? null, "camera");
          e.target.value = ""; // so picking the same photo again still fires
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          choose(e.target.files?.[0] ?? null);
          e.target.value = ""; // so picking the same photo again still fires
        }}
      />
    </section>
  );
}
