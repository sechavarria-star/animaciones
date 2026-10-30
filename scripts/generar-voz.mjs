// Genera la narración con espeak-ng (offline, gratis) y calcula tiempos de palabras
// para los subtítulos. Los tiempos son estimados por largo de palabra, no exactos.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const texto = process.argv[2] ?? "Hola. Este es un instructivo de prueba. Vamos a ver el paso a paso.";
const wav = "public/voz.wav";

execFileSync("espeak-ng", ["-v", "es", "-s", "150", "-w", wav, texto]);

const duracionSeg = Number(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString()
);

const palabras = texto.split(/\s+/);
const total = palabras.reduce((n, p) => n + p.length, 0);
let t = 0;
const tiempos = palabras.map((palabra) => {
  const inicio = t;
  t += (palabra.length / total) * duracionSeg;
  return { palabra, inicio, fin: t };
});

writeFileSync("src/voz.json", JSON.stringify({ duracionSeg, palabras: tiempos }, null, 2));
console.log(`Voz: ${duracionSeg.toFixed(2)} s, ${palabras.length} palabras`);
