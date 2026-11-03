import * as React from "react";
import { Viewport, type SceneId } from "./Viewport";
import { slide } from "@/lib/motion";

// A one-line toggle under an entry. The WebGL viewport mounts only when opened,
// so the home page loads no shaders until someone asks for a demo.
// Opening slides it down like a Blender panel while its first frames redraw low-res,
// then sharp (.rerender-canvas, global.css); closing slides it shut, then unmounts it.
export function LiveDemo({ scene, label }: { scene: SceneId; label: string }) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const box = boxRef.current;
    if (open && box) slide(box, 0, box.getBoundingClientRect().height, 220);
  }, [open]);

  const toggle = () => {
    if (!open) {
      setMounted(true);
      setOpen(true);
      return;
    }
    setOpen(false);
    const box = boxRef.current;
    if (!box) return setMounted(false);
    slide(box, box.getBoundingClientRect().height, 0, 180).then((finished) => {
      if (!finished) return;
      // Hold it shut until React unmounts it, or it springs back to full height for a frame.
      box.style.height = "0px";
      box.style.overflow = "clip";
      setMounted(false);
    });
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="flex w-full sm:inline-flex sm:w-auto items-center gap-2 min-h-8 py-1.5 px-3 rounded-md border border-primary/50 bg-primary/10 text-sm font-medium text-primary text-left hover:bg-primary/20 transition-colors"
      >
        <span aria-hidden="true" className="relative flex size-2 shrink-0">
          {!open && <span className="absolute inline-flex size-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />}
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        {/* One run of text, so on a phone it wraps like a sentence instead of as two centred columns. */}
        <span className="flex-1 min-w-0">
          {open ? "Hide demo" : "Try it in your browser"}{" "}
          <span className="font-normal text-primary/80">· {label}</span>
        </span>
        <span aria-hidden="true" className={"inline-block shrink-0 transition-transform " + (open ? "rotate-90" : "")}>▸</span>
      </button>
      {mounted && (
        // The gap sits inside the sliding box (padding on an inner div), so the box can close to 0.
        <div ref={boxRef} className="rerender-canvas">
          <div className="pt-2">
            <Viewport fixed={scene} embedded />
          </div>
        </div>
      )}
    </div>
  );
}
