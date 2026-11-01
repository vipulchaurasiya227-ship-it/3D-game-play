import { Joystick } from "react-joystick-component";
import { useGameStore } from "./store";

export default function MobileControls() {
  const setJoystick = useGameStore((state) => state.setJoystick);
  const requestJump = useGameStore((state) => state.requestJump);

  const handleMove = (event) => {
    setJoystick((event.x || 0) / 50, -(event.y || 0) / 50);
  };

  const handleStop = () => setJoystick(0, 0);

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <div className="pointer-events-auto absolute bottom-6 left-5 sm:bottom-8 sm:left-8">
        <div className="rounded-full border border-cyan-300/30 bg-slate-950/55 p-3 shadow-[0_0_35px_rgba(34,211,238,0.2)] backdrop-blur-md sm:p-4">
          <Joystick
            size={window.innerWidth < 640 ? 112 : 132}
            baseColor="rgba(15, 23, 42, 0.72)"
            stickColor="rgba(103, 232, 249, 0.9)"
            move={handleMove}
            stop={handleStop}
          />
        </div>
        <p className="mt-2 text-center text-[9px] tracking-[0.3em] text-cyan-200/70">
          SLIDE TO MOVE
        </p>
      </div>

      <button
        type="button"
        aria-label="Jump"
        onPointerDown={requestJump}
        className="pointer-events-auto absolute bottom-9 right-6 flex h-20 w-20 items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-950/50 text-xs font-bold tracking-widest text-fuchsia-100 shadow-[0_0_28px_rgba(217,70,239,0.35)] backdrop-blur-md transition active:scale-95 sm:bottom-12 sm:right-10 sm:h-24 sm:w-24"
      >
        JUMP
      </button>
    </div>
  );
}
