// Genera la narración de cada escena con espeak-ng (offline, gratis) y calcula
// los tiempos de palabra para los subtítulos. Los tiempos son estimados por largo de palabra.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const PAUSA = 0.6;
const guion = JSON.parse(readFileSync("src/guion.json", "utf8"));

const duracion = (archivo) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo]).toString());

const escenas = [];
const pistas = [];
let t = 0;

guion.escenas.forEach((escena, i) => {
  const crudo = `public/escena-${i + 1}.wav`;
  const pad = `public/escena-${i + 1}-pad.wav`;
  execFileSync("espeak-ng", ["-v", "es", "-s", "150", "-w", crudo, escena.texto]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-af", `apad=pad_dur=${PAUSA}`, pad]);

  const habla = duracion(crudo);
  const palabras = escena.texto.split(/\s+/);
  const letras = palabras.reduce((n, p) => n + p.length, 0);
  let c = t;
  const tiempos = palabras.map((palabra) => {
    const inicio = c;
    c += (palabra.length / letras) * habla;
    return { palabra, inicio, fin: c };
  });

  escenas.push({ inicio: t, fin: t + habla + PAUSA, palabras: tiempos });
  pistas.push(pad);
  t += habla + PAUSA;
});

execFileSync("ffmpeg", [
  "-v", "error", "-y",
  ...pistas.flatMap((p) => ["-i", p]),
  "-filter_complex", `${pistas.map((_, i) => `[${i}:a]`).join("")}concat=n=${pistas.length}:v=0:a=1[a]`,
  "-map", "[a]", "public/voz.wav",
]);

writeFileSync("src/voz.json", JSON.stringify({ duracionSeg: t, escenas }, null, 2));
console.log(`Voz: ${t.toFixed(2)} s, ${escenas.length} escenas`);
