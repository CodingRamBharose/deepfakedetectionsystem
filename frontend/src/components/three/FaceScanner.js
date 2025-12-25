"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Html,
  Billboard,
} from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/* Loading placeholder */
function LoadingMesh() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#06b6d4" wireframe />
    </mesh>
  );
}

/* Face Model */
function FaceModel() {
  const gltf = useGLTF("/models/female_face.glb");

  // ❌ DO NOT touch materials at all
  // Wireframe clone with subtle pulse (structural overlay)
  const wireframe = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00eaff,
          wireframe: true,
          transparent: true,
          opacity: 0.14,
        });
      }
    });
    return clone;
  }, [gltf.scene]);

  const wireRef = useRef();
  useFrame(({ clock }) => {
    if (wireRef.current) {
      const t = clock.getElapsedTime();
      wireRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity = 0.12 + 0.05 * (0.5 + 0.5 * Math.sin(t * 1.2));
        }
      });
    }
  });

  // Heat glow texture (eyes, mouth)
  const heatTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grd.addColorStop(0, "rgba(0,234,255,0.45)");
    grd.addColorStop(0.6, "rgba(255,255,0,0.25)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,size,size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.transparent = true;
    return tex;
  }, []);

  // Try to locate feature nodes; fall back to bbox-based offsets
  const features = useMemo(() => {
    const findNode = (patterns) => {
      let found = null;
      gltf.scene.traverse((child) => {
        if (found) return;
        if (!child.name) return;
        const name = child.name.toLowerCase();
        if (patterns.some((p) => name.includes(p))) found = child;
      });
      return found;
    };

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const leftEyeNode = findNode(["eye_l", "left_eye", "eye_lid_l", "eye_l", "eye" ]);
    const rightEyeNode = findNode(["eye_r", "right_eye", "eye_lid_r", "eye_r", "eye" ]);
    const mouthNode = findNode(["mouth", "lip", "teeth"]); 

    const approxLeftEye = new THREE.Vector3(center.x - size.x * 0.1, center.y + size.y * 0.05, center.z + size.z * 0.05);
    const approxRightEye = new THREE.Vector3(center.x + size.x * 0.1, center.y + size.y * 0.05, center.z + size.z * 0.05);
    const approxMouth = new THREE.Vector3(center.x, center.y - size.y * 0.12, center.z + size.z * 0.05);

    return {
      leftEye: leftEyeNode ? leftEyeNode.getWorldPosition(new THREE.Vector3()) : approxLeftEye,
      rightEye: rightEyeNode ? rightEyeNode.getWorldPosition(new THREE.Vector3()) : approxRightEye,
      mouth: mouthNode ? mouthNode.getWorldPosition(new THREE.Vector3()) : approxMouth,
    };
  }, [gltf.scene]);

  return (
    <group>
      {/* Original model - unchanged transforms */}
      <primitive
        object={gltf.scene}
        scale={0.053}
        position={[0, -20, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Wireframe overlay - same transforms */}
      <primitive
        ref={wireRef}
        object={wireframe}
        scale={0.053}
        position={[0, -20, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Heat glow billboards near eyes and mouth */}
      <Billboard position={[features.leftEye.x, features.leftEye.y, features.leftEye.z]}>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={heatTexture} transparent depthWrite={false} />
        </mesh>
      </Billboard>
      <Billboard position={[features.rightEye.x, features.rightEye.y, features.rightEye.z]}>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial map={heatTexture} transparent depthWrite={false} />
        </mesh>
      </Billboard>
      <Billboard position={[features.mouth.x, features.mouth.y, features.mouth.z]}>
        <mesh>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial map={heatTexture} transparent depthWrite={false} />
        </mesh>
      </Billboard>

      {/* HUD labels */}
      <Html position={[features.leftEye.x, features.leftEye.y + 2.2, features.leftEye.z]} center style={{ pointerEvents: "none", color: "#67e8f9", fontSize: 12, opacity: 0.9 }}>
        Analyzing eye region…
      </Html>
      <Html position={[features.mouth.x, features.mouth.y - 2.2, features.mouth.z]} center style={{ pointerEvents: "none", color: "#67e8f9", fontSize: 12, opacity: 0.9 }}>
        Checking lip-sync consistency…
      </Html>
    </group>
  );
}

export default function FaceScanner() {
  return (
    <div className="relative w-full h-[420px] bg-gradient-to-b from-transparent to-cyan-950/20">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }} // unchanged
        gl={{
          alpha: true,
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        {/* Glass panel backdrop */}
        <mesh position={[0, -12, -5]}>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#0a1b2b" transparent opacity={0.22} roughness={0.3} metalness={0.4} />
        </mesh>
        {/* 🌍 Environment lighting = 80% of realism */}
        <Environment preset="studio" />

        {/* ONE key light only */}
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        <Suspense fallback={<LoadingMesh />}>
          <FaceModel />
        </Suspense>

        {/* Lock camera */}
        <OrbitControls
          enableRotate={false}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>

      {/* Scan lines (vertical + horizontal) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scan-line" />
        <div className="scan-line-horizontal" />
      </div>
    </div>
  );
}

useGLTF.preload("/models/female_face.glb");
