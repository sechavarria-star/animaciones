#!/bin/sh
# Chromium con WebGL por software (sin GPU), necesario para renderizar escenas 3D en este entorno.
exec /opt/pw-browsers/chromium --enable-unsafe-swiftshader "$@"
