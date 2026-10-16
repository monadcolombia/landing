"use client";

import dynamic from "next/dynamic";
import DeferredMount from "./DeferredMount";

// The tweet embeds pull react-tweet plus ~500 KB of images from X. Load them
// only when the visitor scrolls near the section.
const Highlights = dynamic(() => import("./Highlights"), { ssr: false });

export default function LazyHighlights() {
  return (
    <DeferredMount
      rootMargin="800px"
      placeholder={
        <section id="highlights" className="bg-monad-dark min-h-[900px]" aria-hidden="true" />
      }
    >
      <Highlights />
    </DeferredMount>
  );
}
