import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const CLUB = new THREE.Color("#1d6fe0");
const DESDE = -2.4;
const HASTA = 0;

// Carga el FBX una sola vez y lo devuelve listo para usar.
const useFbx = (archivo: string, handle: number) => {
  const [modelo, setModelo] = useState<THREE.Group | null>(null);
  useEffect(() => {
    new FBXLoader().loadAsync(staticFile(archivo)).then((fbx) => {
      // Las piezas tienen cajas de bind-pose mal calculadas: sin esto Three.js las recorta.
      fbx.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.frustumCulled = false;
      });
      // Escala a 1.75 m midiendo el esqueleto (cabeza a pie).
      fbx.updateMatrixWorld(true);
      const y = (n: string) => fbx.getObjectByName(`mixamorig${n}`)!.getWorldPosition(new THREE.Vector3()).y;
      const altura = y("HeadTop_End") - Math.min(y("LeftToeBase"), y("LeftFoot"));
      fbx.scale.setScalar(1.75 / altura);
      // Las texturas embebidas cargan en segundo plano; sin esperarlas el modelo sale negro.
      const texturas: THREE.Texture[] = [];
      fbx.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
          for (const tex of Object.values(mat).filter((v): v is THREE.Texture => v instanceof THREE.Texture)) {
            texturas.push(tex);
          }
        }
      });
      const lista = () => texturas.every((t) => t.image && (t.image as HTMLImageElement).complete !== false);
      return new Promise<void>((ok) => {
        const inicio = Date.now();
        const chequear = () => (lista() || Date.now() - inicio > 20000 ? ok() : setTimeout(chequear, 50));
        chequear();
      }).then(() => {
        texturas.forEach((t) => (t.needsUpdate = true));
        setModelo(fbx);
      });
    }).catch((e) => {
      console.error("No se pudo cargar", archivo, e);
      continueRender(handle);
    });
  }, [archivo, handle]);
  return modelo;
};

const hueso = (modelo: THREE.Object3D, nombre: string) => modelo.getObjectByName(`mixamorig${nombre}`);

// Caminata hecha por código; con las animaciones de Mixamo se reemplaza por captura de movimiento real.
const posar = (modelo: THREE.Object3D, fase: number, intensidad: number) => {
  const s = Math.sin(fase) * intensidad;
  const rodilla = (v: number) => -Math.max(0, v) * 0.9 * intensidad;
  // Rota cada hueso relativo a su pose base (los huesos de Mixamo no parten de rotación cero).
  const set = (n: string, x = 0, y = 0, z = 0) => {
    const h = hueso(modelo, n);
    if (!h) return;
    h.userData.base ??= h.quaternion.clone();
    h.quaternion.copy(h.userData.base).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)));
  };
  set("LeftUpLeg", -s * 0.5);
  set("RightUpLeg", s * 0.5);
  set("LeftLeg", rodilla(Math.sin(fase - 1.2)));
  set("RightLeg", rodilla(Math.sin(fase + Math.PI - 1.2)));
  set("LeftArm", 1.2, s * 0.35, 0);
  set("RightArm", 1.2, -s * 0.35, 0);
  set("LeftForeArm", 0, 0, -0.15);
  set("RightForeArm", 0, 0, 0.15);
};

const Escena: React.FC<{ modelo: THREE.Group; handle: number }> = ({ modelo, handle }) => {
  const frame = useCurrentFrame();
  const { advance } = useThree();
  useEffect(() => {
    advance(performance.now());
    continueRender(handle);
  }, [advance, handle]);
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const avance = interpolate(t, [0, 3.2], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(avance, [0, 1], [DESDE, HASTA]);
  const caminando = avance < 1 ? 1 : interpolate(t, [3.2, 3.6], [1, 0], { extrapolateRight: "clamp" });

  posar(modelo, t * 7, caminando);
  modelo.position.set(x, 0, 0);
  modelo.rotation.y = interpolate(t, [3.2, 3.8], [Math.PI / 2, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const top = useMemo(() => {
    let encontrado: THREE.Mesh | null = null;
    modelo.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && /top/i.test(m.name)) encontrado = m;
    });
    return encontrado as THREE.Mesh | null;
  }, [modelo]);
  const original = useMemo(() => (top ? top.material : null), [top]);
  const camiseta = useMemo(() => new THREE.MeshStandardMaterial({ color: CLUB, roughness: 0.6 }), []);
  if (top && original) top.material = t >= 5 ? camiseta : original;

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#9cc36b" />
      </mesh>
      <primitive object={modelo} />
    </>
  );
};

export const DemoRemy: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Cargando responsable.fbx", { timeoutInMilliseconds: 120000 }));
  const modelo = useFbx("responsable.fbx", handle);
  const flash = interpolate(frame, [148, 150, 158], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#cfe3ef, #e9f1f5)", fontFamily: "sans-serif" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 1.3, 4.2], fov: 40 }} onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}>
        {modelo && <Escena modelo={modelo} handle={handle} />}
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", top: 30, left: 40, fontSize: 32, color: "#1b1b3a" }}>
        {frame < 150 ? "Demo · llega con ropa propia" : "Demo · cambia a la camiseta del club"}
      </div>
    </AbsoluteFill>
  );
};
