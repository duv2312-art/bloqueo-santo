#!/bin/sh
# Captura una página con Edge sin interfaz.
# Uso: sh captura.sh "<ruta y parámetros bajo http://127.0.0.1:8766/>" ANCHO ALTO salida.png [espera_ms]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
PERFIL="$(mktemp -d)"
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$PERFIL" --virtual-time-budget="${5:-4000}" \
  --window-size="$2,$3" --screenshot="$4" "http://127.0.0.1:8766/$1" 2>/dev/null
rm -rf "$PERFIL"
