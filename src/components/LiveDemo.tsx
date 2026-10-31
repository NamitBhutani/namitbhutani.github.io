import * as React from "react";
import { Viewport, type SceneId } from "./Viewport";

// A one-line toggle under an entry. The WebGL viewport mounts only when opened,
// so the home page loads no shaders until someone asks for a demo.
export function LiveDemo({ scene, label }: { scene: SceneId; label: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-primary/50 bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        <span aria-hidden="true" className="relative flex size-2">
          {!open && <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />}
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        {open ? "Hide demo" : "Try it in your browser"}
        <span className="font-normal text-primary/80">· {label}</span>
        <span aria-hidden="true" className={"inline-block transition-transform " + (open ? "rotate-90" : "")}>▸</span>
      </button>
      {open && (
        <div className="mt-2">
          <Viewport fixed={scene} embedded />
        </div>
      )}
    </div>
  );
}
