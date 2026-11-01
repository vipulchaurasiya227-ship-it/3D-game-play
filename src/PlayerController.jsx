import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "./store";

const keys = new Set();
const lanes = [-2.4, 0, 2.4];

export default function PlayerController() {
  const bodyRef = useRef(null);
  const avatarRef = useRef(null);
  const laneRef = useRef(1);
  const { camera } = useThree();
  const joystick = useGameStore((state) => state.joystick);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const demoMode = useGameStore((state) => state.demoMode);
  const gameOver = useGameStore((state) => state.gameOver);
  const runId = useGameStore((state) => state.runId);
  const jumpRequested = useGameStore((state) => state.jumpRequested);
  const consumeJump = useGameStore((state) => state.consumeJump);
  const endGame = useGameStore((state) => state.endGame);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const updateDistance = useGameStore((state) => state.updateDistance);
  const lastRunRef = useRef(runId);

  useEffect(() => {
    const down = (event) => {
      keys.add(event.code);
      if (event.code === "ArrowLeft" || event.code === "KeyA") laneRef.current = Math.max(0, laneRef.current - 1);
      if (event.code === "ArrowRight" || event.code === "KeyD") laneRef.current = Math.min(2, laneRef.current + 1);
    };
    const up = (event) => keys.delete(event.code);
    const clear = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;
    if (lastRunRef.current !== runId) {
      lastRunRef.current = runId;
      laneRef.current = 1;
      body.setTranslation({ x: 0, y: 1.4, z: 8 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
    const position = body.translation();
    const targetLane = Math.abs(joystick.x) > 0.55
      ? Math.min(2, Math.max(0, laneRef.current + (joystick.x > 0 ? 1 : -1)))
      : laneRef.current;
    if (Math.abs(joystick.x) > 0.55) laneRef.current = targetLane;

    if ((gameStarted || demoMode) && !gameOver) {
      const speed = Math.min(15, 8 + Math.max(0, 8 - position.z) * 0.018);
      const demoForward = demoMode ? 1 : 0;
      const nextX = THREE.MathUtils.damp(position.x, lanes[laneRef.current], 14, delta);
      const velocity = body.linvel();
      const grounded = Math.abs(velocity.y) < 0.1;
      const shouldJump = jumpRequested || keys.has("Space") || keys.has("ArrowUp");
      body.setLinvel({ x: (nextX - position.x) / Math.max(delta, 0.001), y: shouldJump && grounded ? 9 : velocity.y, z: -(speed + demoForward) }, true);
      body.wakeUp();
      if (shouldJump && grounded) consumeJump();
      updateDistance(Math.max(0, Math.floor((8 - position.z) * 1.4)));
      setPlayerPosition(position.x, position.y, position.z);
      if (avatarRef.current) {
        avatarRef.current.rotation.z = THREE.MathUtils.damp(avatarRef.current.rotation.z, (lanes[laneRef.current] - position.x) * -0.08, 10, delta);
        avatarRef.current.position.y = Math.sin(performance.now() * 0.014) * 0.035;
      }
    } else {
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true);
    }

    const cameraTarget = new THREE.Vector3(position.x, position.y + 1, position.z - 7);
    const desiredCamera = new THREE.Vector3(position.x, position.y + 4.8, position.z + 10);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, delta));
    camera.lookAt(cameraTarget);

    if (position.y < -8 && !gameOver && !demoMode) endGame();
  });

  return (
    <RigidBody ref={bodyRef} position={[0, 1.4, 8]} enabledRotations={[false, false, false]} linearDamping={0.1} colliders={false}>
      <CapsuleCollider args={[0.55, 0.42]} />
      <group ref={avatarRef}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <capsuleGeometry args={[0.32, 0.55, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={0.7} />
        </mesh>
        <mesh castShadow position={[0, 1.45, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.5} />
        </mesh>
        <mesh castShadow position={[0, 1.66, 0]}>
          <coneGeometry args={[0.31, 0.28, 8]} />
          <meshStandardMaterial color="#7c3aed" emissive="#a855f7" emissiveIntensity={1} />
        </mesh>
        {[-0.18, 0.18].map((x) => <mesh key={`arm-${x}`} castShadow position={[x, 0.82, 0]}><capsuleGeometry args={[0.09, 0.45, 6, 10]} /><meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.8} /></mesh>)}
        {[-0.12, 0.12].map((x) => <mesh key={`leg-${x}`} castShadow position={[x, 0.25, 0]}><capsuleGeometry args={[0.1, 0.48, 6, 10]} /><meshStandardMaterial color="#4ade80" emissive="#16a34a" emissiveIntensity={0.6} /></mesh>)}
        <pointLight position={[0, 1.2, 0]} color="#f97316" intensity={1.5} distance={3} />
      </group>
    </RigidBody>
  );
}
