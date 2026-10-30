import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voz from "./voz.json";

const CLUB = "#0090FF";
const CIVIL = "#6b7280";
const PISO = 560;

// Persona genérica y original. `cambio` 0 = ropa civil, 1 = camiseta del club.
const Persona: React.FC<{ color: string; cambio?: number; boca?: number; gorra?: string; escala?: number }> = ({
  color, cambio = 1, boca = 0, gorra, escala = 1,
}) => (
  <svg width={160 * escala} height={320 * escala} viewBox="0 0 160 320">
    <rect x="50" y="190" width="22" height="120" rx="11" fill="#1b1b3a" />
    <rect x="88" y="190" width="22" height="120" rx="11" fill="#1b1b3a" />
    <g opacity={1 - cambio}>
      <rect x="40" y="100" width="80" height="100" rx="14" fill={CIVIL} />
      <rect x="18" y="104" width="26" height="92" rx="13" fill={CIVIL} />
      <rect x="116" y="104" width="26" height="92" rx="13" fill={CIVIL} />
    </g>
    <g opacity={cambio}>
      <rect x="40" y="100" width="80" height="100" rx="14" fill={color} />
      <rect x="18" y="104" width="26" height="92" rx="13" fill={color} />
      <rect x="116" y="104" width="26" height="92" rx="13" fill={color} />
    </g>
    <circle cx="80" cy="60" r="40" fill="#F5C7A1" />
    {gorra && (
      <>
        <path d="M40 52 Q80 2 120 52 Z" fill={gorra} />
        <rect x="32" y="48" width="96" height="8" rx="4" fill={gorra} />
      </>
    )}
    <circle cx="66" cy="62" r="5" fill="#1b1b3a" />
    <circle cx="94" cy="62" r="5" fill="#1b1b3a" />
    <ellipse cx="80" cy="84" rx="12" ry={3 + boca * 8} fill="#7a2e2e" />
  </svg>
);

const Figura: React.FC<{ left: number; escala?: number; children: React.ReactNode }> = ({ left, escala = 1, children }) => (
  <div style={{ position: "absolute", left, top: PISO - 320 * escala }}>{children}</div>
);

const Titulo: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 36, left: 0, right: 0, textAlign: "center", fontSize: 40, opacity: opacidad }}>
      {texto}
    </div>
  );
};

const Pais: React.FC<{ left: number; nombre: string; destino?: boolean }> = ({ left, nombre, destino }) => (
  <>
    <div style={{ position: "absolute", left, top: 180, width: 8, height: PISO - 180, background: "#8a8aa0" }} />
    <div
      style={{
        position: "absolute", left: left + 8, top: 180, width: 140, height: 64, boxSizing: "border-box",
        background: destino ? "#A855F7" : "#2d2d55", border: destino ? "4px solid #ffffff" : "none",
        borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
      }}
    >
      {nombre}
    </div>
  </>
);

const EscenaMesa: React.FC<{ boca: number }> = ({ boca }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const llegada = spring({ frame, fps, config: { damping: 200 }, durationInFrames: fps * 2 });
  const x = interpolate(llegada, [0, 1], [-200, 380]);
  return (
    <AbsoluteFill style={{ background: "#1b1b3a" }}>
      <Titulo texto="Paso 1 · Mesa de control" />
      <Figura left={820}><Persona color="#10b981" /></Figura>
      <div style={{ position: "absolute", left: 760, top: 380, width: 120, height: 40, background: "#f5f5f5", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 700, top: 420, width: 300, height: 24, background: "#8b5a2b", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 720, top: 444, width: 16, height: 116, background: "#6b4423" }} />
      <div style={{ position: "absolute", left: 952, top: 444, width: 16, height: 116, background: "#6b4423" }} />
      <Figura left={x}><Persona color={CLUB} cambio={0} boca={boca} /></Figura>
    </AbsoluteFill>
  );
};

const EscenaPais: React.FC<{ boca: number; cambio: number }> = ({ boca, cambio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const llegada = spring({ frame, fps, config: { damping: 200 }, durationInFrames: fps * 2 });
  const x = interpolate(llegada, [0, 1], [-200, 400]);
  const jugadores = [
    { left: 200, color: "#f59e0b", retraso: 8 },
    { left: 280, color: "#ef4444", retraso: 14 },
    { left: 360, color: "#14b8a6", retraso: 20 },
  ];
  return (
    <AbsoluteFill style={{ background: "#1b1b3a" }}>
      <Titulo texto="Paso 2 · Traslado al país" />
      <Pais left={120} nombre="País A" />
      <Pais left={540} nombre="País B" destino />
      <Pais left={960} nombre="País C" />
      {jugadores.map((j, i) => {
        const entrada = spring({ frame: frame - j.retraso, fps, config: { damping: 200 }, durationInFrames: fps * 2 });
        return (
          <Figura key={i} left={interpolate(entrada, [0, 1], [-200, j.left])} escala={0.6}>
            <Persona color={j.color} escala={0.6} />
          </Figura>
        );
      })}
      <Figura left={x}><Persona color={CLUB} cambio={cambio} boca={boca} /></Figura>
      <Figura left={640}><Persona color="#A855F7" gorra="#A855F7" /></Figura>
    </AbsoluteFill>
  );
};

const Subtitulos: React.FC<{ tiempo: number }> = ({ tiempo }) => {
  const escena = voz.escenas.find((e) => tiempo >= e.inicio && tiempo < e.fin) ?? voz.escenas[voz.escenas.length - 1];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 30, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, fontSize: 30 }}>
      {escena.palabras.map((p, i) => (
        <span key={i} style={{ opacity: tiempo >= p.inicio ? 1 : 0, background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 6 }}>
          {p.palabra}
        </span>
      ))}
    </div>
  );
};

export const Instructivo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiempo = frame / fps;
  const [e1, e2] = voz.escenas;
  const palabraCambio = e2.palabras.find((p) => p.palabra.toLowerCase().startsWith("camiseta"));
  const tCambio = palabraCambio ? palabraCambio.inicio : e2.inicio;
  const cambio = interpolate(tiempo, [tCambio, tCambio + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boca = tiempo < voz.duracionSeg ? Math.abs(Math.sin(frame / 3)) : 0;

  return (
    <AbsoluteFill style={{ background: "#060716", color: "#e8e8f0", fontFamily: "sans-serif" }}>
      <Audio src={staticFile("voz.wav")} />
      <Sequence from={Math.round(e1.inicio * fps)} durationInFrames={Math.round((e1.fin - e1.inicio) * fps)}>
        <EscenaMesa boca={boca} />
      </Sequence>
      <Sequence from={Math.round(e2.inicio * fps)} durationInFrames={Math.ceil((voz.duracionSeg - e2.inicio) * fps) + 1}>
        <EscenaPais boca={boca} cambio={cambio} />
      </Sequence>
      <Subtitulos tiempo={tiempo} />
    </AbsoluteFill>
  );
};
