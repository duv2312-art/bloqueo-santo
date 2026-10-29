"""Convierte los PNG de fondos/png a WebP (1920 px de ancho) para la extensión."""
import pathlib
from PIL import Image

FONDOS = pathlib.Path(__file__).resolve().parent.parent / "extension" / "fondos"
for png in sorted((pathlib.Path(__file__).resolve().parent / "originales").glob("vitral_*.png")):
    im = Image.open(png).convert("RGB")
    im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
    im.save(FONDOS / (png.stem + ".webp"), quality=86, method=6)
    print(png.stem)
