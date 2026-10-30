# Animaciones

Instructivos animados en video con Remotion (stack gratuito).

## Uso

```bash
npm install
npm run voz -- "Texto de la narración"   # genera public/voz.wav y src/voz.json
npm start                                 # vista previa en Remotion Studio
npm run build                             # renderiza out/instructivo.mp4
```

Motor de voz: espeak-ng (offline). Los subtítulos usan tiempos estimados por palabra.
