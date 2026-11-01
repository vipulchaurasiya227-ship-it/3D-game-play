import { useRef } from "react";
import { Joystick } from "react-joystick-component";
import { useGameStore } from "./store";

export default function MobileControls() {
  const setJoystick = useGameStore((state) => state.setJoystick);
  const requestJump = useGameStore((state) => state.requestJump);
  const requestLaneChange = useGameStore((state) => state.requestLaneChange);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const touchStart = useRef(null);

  const handleSwipeStart = (event) => {
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const handleSwipeEnd = (event) => {
    if (!touchStart.current) return;
    const dx = event.clientX - touchStart.current.x;
    const dy = event.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
      requestLaneChange(dx > 0 ? 1 : -1);
    }
  };

  const handleMove = (event) => {
    setJoystick((event.x || 0) / 50, -(event.y || 0) / 50);
  };

  const handleStop = () => setJoystick(0, 0);

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {gameStarted && (
        <div
          className="pointer-events-auto absolute inset-x-0 top-0 h-[48%] touch-none"
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
        />
      )}
      <div className="pointer-events-auto absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] sm:bottom-8 sm:left-8">
        <div className="rounded-full border border-cyan-300/30 bg-slate-950/55 p-3 shadow-[0_0_35px_rgba(34,211,238,0.2)] backdrop-blur-md sm:p-4">
          <Joystick
            size={window.innerWidth < 640 ? 124 : 132}
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
        onPointerDown={(event) => {
          event.preventDefault();
          requestJump();
        }}
        className="pointer-events-auto absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] flex h-20 w-20 touch-none items-center justify-center rounded-full border border-fuchsia-300/50 bg-fuchsia-950/50 text-xs font-bold tracking-widest text-fuchsia-100 shadow-[0_0_28px_rgba(217,70,239,0.35)] backdrop-blur-md transition active:scale-95 sm:bottom-12 sm:right-10 sm:h-24 sm:w-24"
      >
        JUMP
      </button>
    </div>
  );
}
