import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Plane({ position, color, rot }: { position: [number, number, number]; color: string; rot: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.x = rot + Math.sin(t * 0.2) * 0.08;
      ref.current.rotation.y = rot + Math.cos(t * 0.18) * 0.08;
    }
  });
  return (
    <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} position={position}>
        <planeGeometry args={[2.6, 1.6, 1, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </Float>
  );
}

export function AuroraBackdrop({ dense = false }: { dense?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 grid-noise opacity-60" />
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Plane position={[-1.6, 0.6, 0]} color="#7c5cff" rot={-0.3} />
            <Plane position={[1.4, -0.4, -0.6]} color="#5ad6ff" rot={0.4} />
            {dense && <Plane position={[0, 1.2, -1.2]} color="#a48bff" rot={0.15} />}
            {dense && <Plane position={[0.2, -1.4, -0.4]} color="#6cf2ff" rot={-0.5} />}
          </Suspense>
        </Canvas>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
