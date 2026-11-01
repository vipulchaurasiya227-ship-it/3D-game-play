import { useRef } from "react";
import { useGameStore } from "./store";

export default function MobileControls() {
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

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {gameStarted && (
        <div
          className="pointer-events-auto absolute inset-0 touch-none"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            handleSwipeStart(event);
          }}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={() => {
            touchStart.current = null;
          }}
        />
      )}
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
