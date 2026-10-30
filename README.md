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

## Personajes 3D (Mixamo)

Los modelos `.fbx` van en `public/` (no se versionan; copia de trabajo en `assets/`).
`npm run demo` renderiza la demo de Remy. Las escenas 3D usan WebGL por software
(`scripts/chromium-webgl.sh`) porque el entorno no tiene GPU.
