# Mantenimiento de Bloqueo Santo

Notas para quien mantiene el proyecto. Si solo quieres usar la extensión, instálala desde la tienda (ver el [README](README.md)).

## Probar cambios en local

1. En `chrome://extensions` (o `edge://extensions`), activa **Modo de desarrollador**.
2. Pulsa **Cargar descomprimida** y elige la carpeta `extension/`.
3. Después de cada cambio, pulsa el botón de recargar ↻ de la extensión.

Pruebas sin navegador:

- `node tools/prueba_fondo.js` prueba las reglas de bloqueo y la redirección de pestañas.
- `tools/arnes.html` carga cualquier página de la extensión con una API de Chrome simulada. Para usarlo, sirve la raíz con `python -m http.server 8766`. Los parámetros están documentados en el propio archivo.
- `sh tools/captura.sh` saca capturas con Edge sin interfaz (las de `tienda/capturas` salen de aquí).

## Citas

- La fuente de verdad es `tools/citas_publicacion.json`. Guarda, para cada cita, la edición, la URL donde se comprobó, el texto original de las traducciones y la justificación de derechos.
- `python tools/generar_citas.py` crea `extension/citas.js` a partir de ese archivo.
- **Criterio para nuevas citas.** Solo se aceptan tres tipos de fuente:
  - dominio público (autor fallecido hace más de 80 años, o traducción de hace más de 100);
  - traducción propia de un original de dominio público;
  - texto oficial de la Santa Sede, en cita breve.

  No se usan traducciones con derechos (*Libro del Pueblo de Dios*, BAC, Biblia de Jerusalén…) ni obras de terceros con derechos vigentes.

## Imágenes

- `python tools/gen_vitrales.py` genera vitrales con Qwen Image 2.1 en un ComfyUI local (puerto 8000) y los guarda en `tools/originales/`. Esa carpeta no se sube al repositorio.
- `python tools/a_webp.py` los convierte a WebP en `extension/fondos/`.
- Si cambia la cantidad de vitrales, hay que ajustar `TOTAL_FONDOS` en `extension/bloqueo.js`.

## Publicar una versión

1. Sube `version` en `extension/manifest.json`.
2. Ejecuta `python tools/empaquetar.py`, que comprueba los archivos y crea `tienda/bloqueo-santo-<versión>.zip`.
3. Sube el `.zip` en:
   - el panel de desarrollador de la **Chrome Web Store** (registro único de 5 US$);
   - **Microsoft Partner Center**, para Edge Add-ons (gratis).
4. Los textos de la ficha están en `tienda/ficha-tienda.md` y `tienda/practicas-privacidad.md`.
5. Las imágenes de la ficha están en:
   - `tienda/capturas`: 1280×800;
   - `tienda/promo`: 440×280 y 1400×560.
6. La política de privacidad está en `docs/politica-privacidad.html` y la publica GitHub Pages en <https://duv2312-art.github.io/bloqueo-santo/politica-privacidad.html>.

La donación se configura en `extension/config.js` (usuario de PayPal.me y montos sugeridos).

## Carpetas

- `extension/`: la extensión; es lo único que va en el `.zip`.
- `docs/`: página pública y política de privacidad (GitHub Pages).
- `tienda/`: textos e imágenes para las fichas de las tiendas.
- `tools/`: scripts para generar imágenes y citas, probar y empaquetar.
