import { ViewTransition } from "react";

// The worker's photo, as one shared element across the photo step, loading screen and result.
// Same view-transition name everywhere, so between screens it only moves and resizes: no fade,
// no new image. Keep it free of opacity and rounded corners; dim or decorate with layers on top.
export function CheckedPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <ViewTransition name="checked-photo" share="photo-move" default="none">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob of the worker's photo */}
      <img src={src} alt={alt} draggable={false} className={`select-none ${className}`} />
    </ViewTransition>
  );
}
