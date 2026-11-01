import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Float, Sky, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics, RigidBody } from "@react-three/rapier";
import PlayerController from "./PlayerController";
import { useGameStore } from "./store";

const lanes = [-2.4, 0, 2.4];
const hazards = Array.from({ length: 28 }, (_, index) => ({
  lane: (index * 7) % 3,
  z: -12 - index * 14,
  type: index % 3 === 0 ? "wall" : index % 3 === 1 ? "fire" : "gate",
}));
const coins = Array.from({ length: 55 }, (_, index) => ({
  lane: (index * 5 + 1) % 3,
  z: -8 - index * 7,
  y: index % 6 === 0 ? 2.5 : 1.25,
}));

const ROAD_LENGTH = 420;

function getLoopedZ(baseZ, playerZ) {
  const cycles = Math.ceil((baseZ - playerZ - 28) / ROAD_LENGTH);
  return baseZ - cycles * ROAD_LENGTH;
}

function Track() {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, -50000]}>
        <mesh visible={false} scale={[10, 1, 100000]}>
          <boxGeometry />
        </mesh>
      </RigidBody>
      {Array.from({ length: 55 }, (_, index) => (
        <RigidBody key={`track-${index}`} type="fixed" colliders="cuboid" position={[0, -0.5, 8 - index * 14]}>
          <mesh receiveShadow scale={[10, 1, 14]}>
            <boxGeometry />
            <meshStandardMaterial color={index % 2 ? "#172554" : "#1e1b4b"} roughness={0.5} metalness={0.45} />
          </mesh>
        </RigidBody>
      ))}
      <mesh position={[-3.65, 0.03, -370]} scale={[0.08, 0.04, 390]}><boxGeometry /><meshBasicMaterial color="#facc15" /></mesh>
      <mesh position={[3.65, 0.03, -370]} scale={[0.08, 0.04, 390]}><boxGeometry /><meshBasicMaterial color="#facc15" /></mesh>
    </>
  );
}

function Coin({ item }) {
  const ref = useRef(null);
  const collectedCycle = useRef(null);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const addCoin = useGameStore((state) => state.addCoin);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const loopedZ = getLoopedZ(item.z, playerPosition[2]);
    const cycle = Math.round((item.z - loopedZ) / ROAD_LENGTH);
    ref.current.position.z = loopedZ;
    ref.current.rotation.y += delta * 5;
    if (collectedCycle.current !== cycle && Math.hypot(playerPosition[0] - lanes[item.lane], playerPosition[1] - item.y, playerPosition[2] - loopedZ) < 1) {
      collectedCycle.current = cycle;
      addCoin();
    }
  });
  return <Float speed={4} floatIntensity={0.25}><mesh ref={ref} position={[lanes[item.lane], item.y, item.z]}><torusGeometry args={[0.32, 0.1, 12, 24]} /><meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={3} toneMapped={false} /><pointLight color="#facc15" intensity={1.5} distance={3} /></mesh></Float>;
}

function Hazard({ item }) {
  const ref = useRef(null);
  const hitCycle = useRef(null);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const demoMode = useGameStore((state) => state.demoMode);
  const gameOver = useGameStore((state) => state.gameOver);
  const endGame = useGameStore((state) => state.endGame);
  useFrame(() => {
    if (!ref.current) return;
    const loopedZ = getLoopedZ(item.z, playerPosition[2]);
    ref.current.position.z = loopedZ;
    if (!gameStarted || demoMode || gameOver) return;
    const laneHit = Math.abs(playerPosition[0] - lanes[item.lane]) < 0.85;
    const nearHazard = Math.abs(playerPosition[2] - loopedZ) < 1.05;
    const jumpedOver = playerPosition[1] > 2.15;
    const cycle = Math.round((item.z - loopedZ) / ROAD_LENGTH);
    if (laneHit && nearHazard && !jumpedOver && hitCycle.current !== cycle) {
      hitCycle.current = cycle;
      endGame();
    }
  });
  return <group ref={ref} position={[lanes[item.lane], 0.7, item.z]}>{item.type === "wall" ? <mesh castShadow><boxGeometry args={[1.5, 1.4, 1]} /><meshStandardMaterial color="#ef4444" emissive="#991b1b" emissiveIntensity={1.5} /></mesh> : item.type === "fire" ? <><mesh rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.7, 1.6, 6]} /><meshStandardMaterial color="#fb923c" emissive="#ef4444" emissiveIntensity={2} /></mesh><pointLight color="#f97316" intensity={3} distance={4} /></> : <mesh><torusGeometry args={[0.85, 0.16, 8, 20]} /><meshStandardMaterial color="#c026d3" emissive="#e879f9" emissiveIntensity={2} /></mesh>}</group>;
}

export default function Scene() {
  const runId = useGameStore((state) => state.runId);
  return (
    <>
      <Sky distance={450000} sunPosition={[10, 8, -20]} turbidity={7} rayleigh={1.5} />
      <Stars radius={100} depth={60} count={2200} factor={4} saturation={0.8} fade speed={0.6} />
      <Environment preset="night" />
      <fog attach="fog" args={["#09052b", 20, 85]} />
      <ambientLight intensity={0.4} color="#818cf8" />
      <directionalLight castShadow position={[8, 16, 10]} intensity={2.5} shadow-mapSize={[2048, 2048]} />
      <Physics gravity={[0, -22, 0]}>
        <Track />
        {hazards.map((item) => <Hazard key={`${runId}-h-${item.z}`} item={item} />)}
        {coins.map((item) => <Coin key={`${runId}-c-${item.z}`} item={item} />)}
        <PlayerController />
      </Physics>
      <EffectComposer><Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.3} radius={0.7} /></EffectComposer>
    </>
  );
}
