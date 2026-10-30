import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voz from "./voz.json";

// Personaje original (no es de ninguna marca ni serie existente).
const Guia: React.FC<{ boca: number }> = ({ boca }) => (
  <svg width={260} height={420} viewBox="0 0 260 420">
    <rect x="70" y="250" width="120" height="150" rx="20" fill="#0090FF" />
    <rect x="80" y="390" width="40" height="28" rx="8" fill="#1b1b3a" />
    <rect x="140" y="390" width="40" height="28" rx="8" fill="#1b1b3a" />
    <rect x="40" y="260" width="34" height="110" rx="17" fill="#0090FF" transform="rotate(20 57 260)" />
    <rect x="186" y="260" width="34" height="110" rx="17" fill="#0090FF" transform="rotate(-20 203 260)" />
    <circle cx="130" cy="150" r="78" fill="#F5C7A1" />
    <path d="M52 130 Q130 40 208 130 Q190 90 130 80 Q70 90 52 130Z" fill="#A855F7" />
    <circle cx="103" cy="158" r="8" fill="#1b1b3a" />
    <circle cx="157" cy="158" r="8" fill="#1b1b3a" />
    <ellipse cx="130" cy="196" rx="16" ry={4 + boca * 10} fill="#7a2e2e" />
  </svg>
);

export const Instructivo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 14 } });
  const x = interpolate(entrada, [0, 1], [-300, 0]);
  const tiempo = frame / fps;
  const boca = Math.abs(Math.sin(frame / 3)) * (tiempo < voz.duracionSeg ? 1 : 0);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #1b1b3a, #060716)", color: "#e8e8f0", fontFamily: "sans-serif" }}>
      <Audio src={staticFile("voz.wav")} />
      <div style={{ position: "absolute", left: 120, bottom: 120, transform: `translateX(${x}px)` }}>
        <Guia boca={boca} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontSize: 40 }}>
        {voz.palabras.map((p, i) => {
          const visible = tiempo >= p.inicio;
          return (
            <span key={i} style={{ opacity: visible ? 1 : 0, marginRight: 10, background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 6 }}>
              {p.palabra}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
