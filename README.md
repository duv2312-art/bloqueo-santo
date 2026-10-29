# Bloqueo Santo

Extensión de Chrome/Edge que bloquea los sitios que te distraen y, en su lugar, te muestra una cita de la Sagrada Escritura, el Catecismo o los santos, sobre un vitral generado con IA.

## Instalar para uso propio

1. Abre `chrome://extensions` (o `edge://extensions`) y activa **Modo de desarrollador**.
2. Pulsa **Cargar descomprimida** y elige `C:\Apps\Bloqueo Santo\extension`.
3. Fija el icono de la cruz en la barra.

Después de cambiar archivos, pulsa el botón de recargar ↻ de la extensión.

## Uso

- **Bloquear:** estando en el sitio, pulsa el icono y luego **Bloquear este sitio**.
- **Desbloquear:** en la página de bloqueo, pulsa el icono y luego **Desbloquear este sitio**.
- **Otra palabra** (o la barra espaciadora): otra cita y otro vitral.
- **Ajustes** (⚙ o «Ver sitios bloqueados»): lista de sitios y opción de quitar la página de bloqueo del historial, que usa un permiso opcional.
- El café ☕ del menú abre la donación voluntaria por PayPal (1, 2 o 3 US$, u otro monto).

## Las citas y sus derechos

Hay 136 citas: 65 de la Escritura, 49 de santos, papas y maestros espirituales, y 22 del Catecismo. Solo hay tres tipos de fuente:

- **Dominio público:** la Biblia de Torres Amat (1823-1825) y los textos castellanos originales de santa Teresa, san Juan de la Cruz y san Ignacio.
- **Traducción propia:** hecha desde originales de dominio público en latín, francés, italiano o inglés.
- **Texto oficial de la Santa Sede:** el Catecismo y los documentos papales, con el crédito «© Libreria Editrice Vaticana».

El detalle de cada cita está en `tools/citas_publicacion.json`: edición, URL donde se comprobó, texto original de las traducciones y justificación de derechos.

## Publicar en la tienda

1. En `extension/config.js`, pon tu usuario de PayPal.me en `paypal`.
2. La política de privacidad está en `docs/politica-privacidad.html` y se publica con GitHub Pages en https://duv2312-art.github.io/bloqueo-santo/politica-privacidad.html
3. Ejecuta `python tools/empaquetar.py`, que crea `tienda/bloqueo-santo-<versión>.zip`.
4. **Chrome Web Store:** crea la cuenta de desarrollador (pago único de 5 US$) y sube el `.zip`. Copia los textos de `tienda/ficha-tienda.md` y `tienda/practicas-privacidad.md`.
5. **Imágenes para la ficha:**
   - capturas de 1280×800 en `tienda/capturas`;
   - mosaico pequeño de 440×280 y marquesina de 1400×560 en `tienda/promo`.
6. **Edge Add-ons:** en Microsoft Partner Center (gratis), el mismo `.zip` y los mismos textos.

## Carpetas

- `extension/`: la extensión, lo único que va en el `.zip`.
- `docs/`: página pública y política de privacidad (GitHub Pages).
- `tienda/`: textos e imágenes para la ficha, y el `.zip`.
- `tools/`:
  - `gen_vitrales.py`: genera más vitrales con ComfyUI.
  - `a_webp.py`: los convierte a WebP.
  - `generar_citas.py`: crea `extension/citas.js` desde `citas_publicacion.json`.
  - `arnes.html`, `captura.sh` y `prueba_fondo.js`: prueban la extensión y sacan capturas.
  - `empaquetar.py`: arma el `.zip`.
- `tools/originales/`: los PNG originales a resolución completa.
