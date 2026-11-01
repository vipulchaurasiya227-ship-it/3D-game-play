import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useGameStore } from "./store";
import Scene from "./Scene";
import MobileControls from "./MobileControls";

function Overlay() {
  const score = useGameStore((state) => state.score);
  const coins = useGameStore((state) => state.coins);
  const distance = useGameStore((state) => state.distance);
  const bestDistance = useGameStore((state) => state.bestDistance);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  const demoMode = useGameStore((state) => state.demoMode);
  const demoComplete = useGameStore((state) => state.demoComplete);
  const startDemo = useGameStore((state) => state.startDemo);
  const finishDemo = useGameStore((state) => state.finishDemo);
  const startGame = useGameStore((state) => state.startGame);
  const endGame = useGameStore((state) => state.endGame);

  useEffect(() => {
    if (!demoMode) return undefined;
    const timer = window.setTimeout(finishDemo, 5000);
    return () => window.clearTimeout(timer);
  }, [demoMode, finishDemo]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {gameStarted && (
        <div className="absolute left-5 top-5 rounded-2xl border border-cyan-300/30 bg-slate-950/60 px-5 py-3 shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-md">
          <p className="text-[10px] tracking-[0.35em] text-cyan-200/70">NEON RUN</p>
          <p className="mt-1 text-2xl font-bold text-white">{score.toString().padStart(4, "0")}</p>
          <p className="text-xs tracking-widest text-amber-300">◆ {coins} COINS</p>
        </div>
      )}
      {gameStarted && (
        <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs tracking-[0.2em] text-white/80 backdrop-blur-md">
          {distance}M
        </div>
      )}
      {gameStarted && (
        <button type="button" onClick={endGame} className="pointer-events-auto absolute right-5 top-16 z-20 rounded-full border border-rose-300/30 bg-rose-950/50 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-rose-100 backdrop-blur-md transition hover:bg-rose-900/70">
          END RUN
        </button>
      )}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[10px] tracking-[0.25em] text-white/50">
        <p>PC: A/D OR ARROWS · MOBILE: SWIPE LEFT / RIGHT</p>
        <p className="mt-1">SPACE / JUMP BUTTON · COLLECT COINS</p>
      </div>

      {!gameStarted && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-slate-950/55 px-6 backdrop-blur-sm">
          <div className="max-w-xl text-center">
            <p className="mb-3 text-xs tracking-[0.65em] text-cyan-300">NEON RUNNER</p>
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_25px_rgba(103,232,249,0.7)] sm:text-7xl">
              RUN<br /><span className="text-fuchsia-300">BEYOND</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-slate-300">
              An original endless temple-run-style sprint through a neon relic road.
            </p>
            <div className="mx-auto mt-5 grid max-w-lg gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left text-xs leading-5 text-slate-300">
              <p className="font-bold tracking-[0.25em] text-cyan-200">RUN RULES</p>
              <p>1. Your runner sprints forward automatically.</p>
              <p>2. Mobile: swipe left/right. PC/laptop: use A/D or arrow keys.</p>
              <p>3. Press jump, Space, or Up to clear walls, flames, and energy gates.</p>
              <p>4. Collect gold rings for bonus points and survive as long as possible.</p>
            </div>
            {gameOver && (
              <div className="mt-5">
                <p className="text-2xl font-bold text-rose-300">RUN ENDED</p>
                <p className="mt-2 text-xs tracking-widest text-cyan-200">DISTANCE {distance}M · BEST {bestDistance}M</p>
              </div>
            )}
            {demoMode ? (
              <p className="mt-7 animate-pulse text-xs font-bold tracking-[0.35em] text-fuchsia-200">DEMO RUN IN PROGRESS</p>
            ) : gameOver ? (
              <button type="button" onClick={startGame} className="mt-7 rounded-full border border-fuchsia-200/60 bg-fuchsia-300 px-10 py-4 text-xs font-bold tracking-[0.35em] text-slate-950 shadow-[0_0_35px_rgba(217,70,239,0.45)] transition hover:scale-105">PLAY AGAIN</button>
            ) : demoComplete ? (
              <button type="button" onClick={startGame} className="mt-7 rounded-full border border-fuchsia-200/60 bg-fuchsia-300 px-10 py-4 text-xs font-bold tracking-[0.35em] text-slate-950 shadow-[0_0_35px_rgba(217,70,239,0.45)] transition hover:scale-105">START RUN</button>
            ) : (
              <button type="button" onClick={startDemo} className="mt-7 rounded-full border border-cyan-200/60 bg-cyan-300 px-10 py-4 text-xs font-bold tracking-[0.35em] text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.45)] transition hover:scale-105">WATCH DEMO</button>
            )}
          </div>
        </div>
      )}
      <MobileControls />
    </div>
  );
}

export default function App() {
  return (
    <main className="relative h-full w-full bg-[#050816]">
      <Canvas shadows camera={{ position: [0, 5, 18], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={["#050816"]} />
        <Scene />
      </Canvas>
      <Overlay />
    </main>
  );
}
