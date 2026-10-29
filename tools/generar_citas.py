"""Genera extension/citas.js a partir de tools/citas_publicacion.json (la fuente con la verificación)."""
import json, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
citas = json.loads((RAIZ / "tools" / "citas_publicacion.json").read_text(encoding="utf-8"))
lineas = [json.dumps({k: o[k] for k in ("c", "t", "a", "r", "rc", "f") if k in o}, ensure_ascii=False) for o in citas]
(RAIZ / "extension" / "citas.js").write_text(
    "// Citas con su fuente. Solo textos de dominio público, traducciones propias de originales\n"
    "// de dominio público o textos oficiales de la Santa Sede (© Libreria Editrice Vaticana).\n"
    "// Se genera con tools/generar_citas.py desde tools/citas_publicacion.json, que guarda la\n"
    "// verificación de cada una.\n"
    "// c: escritura | catecismo | santos · t: texto · a: autor/libro · r: referencia completa\n"
    "// rc: referencia corta para la página de bloqueo (si la completa es larga) · f: fuente\n"
    "const CITAS = [\n  " + ",\n  ".join(lineas) + ",\n];\n",
    encoding="utf-8",
)
print(len(citas), "citas")
