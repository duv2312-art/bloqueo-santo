"""Arma el .zip para subir a la Chrome Web Store / Edge Add-ons.

Comprueba antes que todo archivo citado por el manifiesto y las páginas exista.
Uso: python empaquetar.py
"""
import json, pathlib, re, sys, zipfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EXT = RAIZ / "extension"
manifiesto = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))

faltan = []
citados = [manifiesto["background"]["service_worker"], manifiesto["action"]["default_popup"],
           manifiesto["options_page"], *manifiesto["icons"].values()]
for html in EXT.glob("*.html"):
    citados += [m for m in re.findall(r'(?:src|href)="([^"#:]+)"', html.read_text(encoding="utf-8"))]
citados += re.findall(r'importScripts\("([^"]+)"\)', (EXT / "background.js").read_text(encoding="utf-8"))
for c in citados:
    if not (EXT / c).exists():
        faltan.append(c)
if faltan:
    sys.exit(f"Faltan archivos: {sorted(set(faltan))}")

config = (EXT / "config.js").read_text(encoding="utf-8")
if 'paypal: ""' in config:
    print("Aviso: CONFIG.paypal está vacío; el icono del café no aparecerá.")

destino = RAIZ / "tienda" / f"bloqueo-santo-{manifiesto['version']}.zip"
with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(EXT.rglob("*")):
        if f.is_file():
            z.write(f, f.relative_to(EXT).as_posix())
print(f"{destino.name}: {destino.stat().st_size / 1e6:.1f} MB")
