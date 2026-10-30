# Animaciones

Instructivos animados en video con Remotion (stack gratuito).

## Uso

```bash
npm install
npm run voz -- "Texto de la narración"   # genera public/voz.wav y src/voz.json
npm start                                 # vista previa en Remotion Studio
npm run build                             # renderiza out/instructivo.mp4
```

Motor de voz: Piper con el modelo es_AR-daniela-high, acento argentino (offline). El modelo va en `models/`, que no se versiona. Los subtítulos usan tiempos estimados por palabra.
