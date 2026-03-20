"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { globalTargets, TargetLocation } from "@/lib/mockData";

// R = 2 is Earth radius
const R = 2;

// Toronto/Canada coordinate mapping: Lat 43.6532° N, Long 79.3832° W
function getCoordinates(lat: number, lng: number, r: number = R) {
  // Three.js Map textures usually put Prime Meridian at X=0, Z=R
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = (r * Math.sin(phi) * Math.sin(theta));
  const y = (r * Math.cos(phi));
  
  return new THREE.Vector3(x, y, z);
}

function EarthWithTexture() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  // High quality blue marble texture for Earth
  const colorMap = useTexture("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005; // Slow rotation
    }
  });

  return (
    <group ref={earthRef as any}>
      {/* Base Earth Sphere */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Targets */}
      {globalTargets.map(target => (
        <TargetMarker key={target.id} target={target} />
      ))}
    </group>
  );
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[R, 32, 32]} />
      <meshStandardMaterial color="#002244" wireframe />
    </mesh>
  );
}

function TargetMarker({ target }: { target: TargetLocation }) {
  const router = useRouter();
  const markerRef = useRef<THREE.Group>(null);
  const pos = getCoordinates(target.lat, target.lng, R + 0.01);
  
  // Orient marker normal to the sphere surface
  useEffect(() => {
    if (markerRef.current) {
        markerRef.current.lookAt(new THREE.Vector3(0,0,0));
    }
  }, []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (target.routeUrl) {
      router.push(target.routeUrl);
    }
  };

  const getColors = (types: string[]) => {
    return types.map(t => {
      if (t === 'completed') return '#00ff00';
      if (t === 'in-progress') return '#ff003c';
      return '#00f0ff'; // upcoming
    });
  };
  
  const colors = getColors(target.types);

  return (
    <group 
      position={pos} 
      onClick={handleClick} 
      onPointerOver={() => document.body.style.cursor='pointer'} 
      onPointerOut={() => document.body.style.cursor='auto'}
      ref={markerRef as any}
    >
      {/* Central Node */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={colors[0]} />
      </mesh>

      {/* Multiple pulsing rings based on status states */}
      {colors.map((color, idx) => (
        <PulsingRing key={idx} color={color} size={0.05 + (idx * 0.03)} delay={idx * 0.5} />
      ))}

      {/* HTML Label */}
      <Html distanceFactor={10} position={[0, 0.1, 0]} className="pointer-events-none">
        <div 
          style={{ color: colors[0], borderColor: `${colors[0]}4d` }}
          className="font-display text-xs w-max whitespace-nowrap border bg-black/60 px-2 py-1 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.8)]"
        >
          &gt; {target.name.toUpperCase()} <br/>
          STATUS: {target.types.map(t => t.toUpperCase()).join(" / ")}
        </div>
      </Html>
    </group>
  );
}

function PulsingRing({ color, size, delay }: { color: string, size: number, delay: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.elapsedTime + delay;
      const scale = 1 + ((Math.sin(t * 3) + 1) / 2) * 1.5; // pulses 1x -> 2.5x
      ringRef.current.scale.set(scale, scale, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - (scale - 1) / 1.5;
    }
  });

  return (
    <mesh ref={ringRef as any} position={[0, 0, 0.01]}>
      <ringGeometry args={[size, size + 0.01, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function BackgroundPlanets() {
  // Array of 8 other planets + Pluto
  const planets = [
    { name: "Mercury", color: "#888888", pos: [8, 3, -12], size: 0.3 },
    { name: "Venus", color: "#e3bb76", pos: [14, -2, -18], size: 0.9 },
    { name: "Mars", color: "#c1440e", pos: [-10, 4, -8], size: 0.5 },
    { name: "Jupiter", color: "#d39c7e", pos: [-18, -6, -20], size: 2.5 },
    { name: "Saturn", color: "#ead6b8", pos: [22, 8, -25], size: 2.0, hasRing: true },
    { name: "Uranus", color: "#4b70dd", pos: [-15, 12, -30], size: 1.2 },
    { name: "Neptune", color: "#274687", pos: [12, -10, -35], size: 1.2 },
    { name: "Pluto", color: "#cdcdcd", pos: [-5, -15, -40], size: 0.2 },
  ];

  return planets.map((p, i) => (
    <group key={i} position={p.pos as [number, number, number]}>
      <mesh>
        <sphereGeometry args={[p.size, 32, 32]} />
        <meshStandardMaterial color={p.color} roughness={0.8} />
      </mesh>
      {p.hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[p.size * 1.4, p.size * 2, 64]} />
          <meshStandardMaterial color="#c5ab89" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
      <Html distanceFactor={25}>
         <div className="text-gray-400 font-display text-xs bg-black/40 px-1 backdrop-blur-sm border border-gray-600/30">
          [{p.name.toUpperCase()} - LOCKED]
         </div>
      </Html>
    </group>
  ));
}

import { useEffect } from "react";
export default function SpaceScene() {
  return (
    <div className="absolute inset-0 bg-[#000000] z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#00f0ff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
        
        <Suspense fallback={<EarthFallback />}>
          <EarthWithTexture />
        </Suspense>
        
        <BackgroundPlanets />

        {/* Let users rotate the Earth closely, limit zoom to not break UI */}
        <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={12} autoRotate autoRotateSpeed={0.2} />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#ff003c] drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
          PLANETS.RUN
        </h1>
        <div className="text-right font-mono text-sm text-[#00f0ff]/80">
          <p>SYSTEM: ONLINE</p>
          <p>STARS ALIGNED: TRUE</p>
          <div className="flex flex-col items-end gap-1 mt-2">
            <span className="text-white bg-[#00ff00]/20 border border-[#00ff00] px-2 text-[10px]">COMPLETED</span>
            <span className="text-white bg-[#ff003c]/20 border border-[#ff003c] px-2 text-[10px]">IN PROGRESS</span>
            <span className="text-white bg-[#00f0ff]/20 border border-[#00f0ff] px-2 text-[10px]">UPCOMING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
