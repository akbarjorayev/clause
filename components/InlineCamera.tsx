"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Aperture, Images, RotateCcw, ScanText, X } from "lucide-react";
import { CheckedPhoto } from "./CheckedPhoto";

interface Props {
  onSubmit: (file: File) => void;
  onCancel: () => void;
  // Opens the device's own picker when the live camera can't start.
  onFallback: () => void;
}

const JPEG_QUALITY = 0.9;
const PORTRAIT_FALLBACK = 3 / 4;

// The preview takes the window's shape: tall on phones, wide on computers.
function readWindowRatio(): number {
  return window.innerWidth / window.innerHeight;
}
function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function cameraSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

// Live camera in the page (computers). Capture freezes the frame in place and turns the camera off;
// the worker then checks it or retakes, without leaving the camera view.
export function InlineCamera({ onSubmit, onCancel, onFallback }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped on every start/stop so a camera that finishes starting after we stopped is shut at once.
  const sessionRef = useRef(0);
  const [failed, setFailed] = useState(false);
  const [captured, setCaptured] = useState<File | null>(null);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const windowRatio = useSyncExternalStore(subscribeToResize, readWindowRatio, () => PORTRAIT_FALLBACK);

  function stopCamera() {
    sessionRef.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function startCamera() {
    const session = ++sessionRef.current;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
      .then((stream) => {
        if (session !== sessionRef.current) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setFailed(true));
  }

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  useEffect(() => {
    if (!frozenFrame) return;
    // The captured frame is on screen now: wait until it has actually been painted (two frames),
    // then turn the camera off. Stopping earlier blanks the video before the photo covers it.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(stopCamera);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      URL.revokeObjectURL(frozenFrame);
    };
  }, [frozenFrame]);

  function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    // Keep only what the preview shows (it crops the camera frame to the window's shape), so the
    // captured photo has the preview's proportions and moves to the loading screen without a jump.
    const shownRatio = video.clientWidth / video.clientHeight;
    const frameRatio = video.videoWidth / video.videoHeight;
    const cropWidth = frameRatio > shownRatio ? video.videoHeight * shownRatio : video.videoWidth;
    const cropHeight = frameRatio > shownRatio ? video.videoHeight : video.videoWidth / shownRatio;
    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    canvas
      .getContext("2d")!
      .drawImage(
        video,
        (video.videoWidth - cropWidth) / 2,
        (video.videoHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        // Decode the frame first so it shows instantly over the still-running video.
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = url;
        await image.decode().catch(() => undefined);
        setFrozenFrame(url);
        setCaptured(new File([blob], "camera.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  }

  function retake() {
    setCaptured(null);
    setFrozenFrame(null);
    startCamera();
  }

  if (failed) {
    return (
      <div className="rounded-3xl bg-paper p-5 text-center shadow-sm ring-1 ring-ink/10">
        <p className="text-lg">The camera couldn&apos;t start. Allow camera access, or use your device&apos;s camera instead.</p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onCancel} className="pressable min-h-14 flex-1 rounded-full bg-desk text-lg font-bold">
            Back
          </button>
          <button
            type="button"
            onClick={onFallback}
            className="pressable flex min-h-14 flex-[2] items-center justify-center gap-2 rounded-full bg-accent text-lg font-bold text-paper"
          >
            <Images aria-hidden className="size-5" />
            Open camera app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ aspectRatio: windowRatio }}
          className="w-full bg-ink object-cover shadow-sm"
        />
        {frozenFrame && (
          <CheckedPhoto src={frozenFrame} alt="Captured photo" className="absolute inset-0 size-full object-cover" />
        )}
      </div>
      <div className="mt-4 flex">
        {/* One button that becomes "Check my contract" after Capture; it shrinks smoothly as the
            retake button grows in beside it, and its label crossfades. */}
        <button
          type="button"
          onClick={captured ? () => onSubmit(captured) : capture}
          className="pressable flex min-h-16 min-w-0 flex-1 items-center justify-center gap-3 rounded-full bg-accent text-xl font-bold text-paper"
        >
          <span key={captured ? "check" : "capture"} className="enter-soft flex items-center gap-3 whitespace-nowrap">
            {captured ? <ScanText aria-hidden className="size-6" /> : <Aperture aria-hidden className="size-6" />}
            {captured ? "Check my contract" : "Capture"}
          </span>
        </button>
        {/* No overflow clipping here, so the button's shadow isn't cut off; while collapsed it is
            invisible and not clickable. */}
        <div
          aria-hidden={!captured}
          className={`slide-width shrink-0 ${captured ? "ml-3 w-16 scale-100" : "pointer-events-none ml-0 w-0 scale-0"}`}
        >
          <button
            type="button"
            onClick={retake}
            tabIndex={captured ? 0 : -1}
            aria-label="Take another photo"
            className="pressable grid size-16 place-items-center rounded-full bg-paper shadow-sm ring-1 ring-ink/10"
          >
            <RotateCcw aria-hidden className="size-6" />
          </button>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close camera"
          className="pressable ml-3 grid size-16 shrink-0 place-items-center rounded-full bg-paper shadow-sm ring-1 ring-ink/10"
        >
          <X aria-hidden className="size-6" />
        </button>
      </div>
    </div>
  );
}
