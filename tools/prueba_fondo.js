// Prueba la lógica del service worker con una API de Chrome simulada.
// Uso: node tools/prueba_fondo.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const EXT = path.join(__dirname, "..", "extension");
const oyentes = {};
const evento = (nombre) => ({ addListener: (f) => (oyentes[nombre] = f) });
let sitios; // instalación nueva: nada guardado
let reglas = [];
const actualizadas = [];
const pestanas = [
  { id: 1, url: "https://www.youtube.com/watch?v=1" },
  { id: 2, url: "https://www.google.com/" },
  { id: 3, url: "https://m.tiktok.com/@x" },
];

const chrome = {
  runtime: { id: "abc", getURL: (p) => "chrome-extension://abc/" + p, onInstalled: evento("instalar"), onStartup: evento("arrancar") },
  storage: {
    sync: { get: async () => ({ sitios }), set: async (o) => { sitios = o.sitios; } },
    onChanged: evento("cambio"),
  },
  declarativeNetRequest: {
    getDynamicRules: async () => reglas,
    updateDynamicRules: async (o) => {
      const ids = new Set(reglas.filter((r) => !o.removeRuleIds.includes(r.id)).map((r) => r.id));
      for (const r of o.addRules) { assert(!ids.has(r.id), "id repetido " + r.id); ids.add(r.id); }
      reglas = o.addRules;
    },
  },
  tabs: {
    onUpdated: evento("pestana"),
    query: async () => pestanas,
    update: (id, o) => actualizadas.push([id, o.url]),
  },
  permissions: { onAdded: evento("permiso") },
};

const ctx = vm.createContext({ chrome, URL, console, importScripts: (...fs_) => fs_.forEach((f) => vm.runInContext(fs.readFileSync(path.join(EXT, f), "utf8"), ctx)) });
vm.runInContext(fs.readFileSync(path.join(EXT, "background.js"), "utf8"), ctx);
const espera = () => new Promise((r) => setTimeout(r, 30));

(async () => {
  // 0. Una instalación nueva no bloquea nada
  await oyentes.instalar();
  await espera();
  assert.strictEqual(JSON.stringify(sitios), "[]", "la lista inicial debe quedar vacía");
  assert.strictEqual(reglas.length, 0, "no debe haber reglas al instalar");

  // 1. Reglas: la regex de declarativeNetRequest (RE2) es compatible con la de JS en este caso
  sitios = ["youtube.com"];
  oyentes.cambio({ sitios: {} }, "sync");
  await espera();
  actualizadas.length = 0;
  const re = new RegExp(reglas[0].condition.regexFilter);
  for (const u of ["https://youtube.com/", "https://www.youtube.com/watch?v=1", "https://m.youtube.com", "https://www.youtube.com./", "http://youtube.com:443/x"])
    assert(re.test(u), "debería bloquear " + u);
  for (const u of ["https://notyoutube.com/", "https://youtube.com.evil.net/", "https://www.youtube.community/"])
    assert(!re.test(u), "no debería bloquear " + u);

  // 2. Al bloquear tiktok, se redirige la pestaña ya abierta de tiktok y no las demás
  sitios = ["youtube.com", "tiktok.com"];
  oyentes.cambio({ sitios: {} }, "sync");
  await espera();
  assert.deepStrictEqual(actualizadas.map((a) => a[0]).sort(), [1, 3]);
  assert.strictEqual(actualizadas.find((a) => a[0] === 3)[1], "chrome-extension://abc/bloqueo.html#https://m.tiktok.com/@x");

  // 3. Navegación interna o botón Atrás hacia un sitio bloqueado (incluido el host con punto final)
  actualizadas.length = 0;
  oyentes.pestana(9, { url: "https://www.youtube.com./shorts/abc" });
  oyentes.pestana(9, { url: "https://www.google.com/search?q=hola" });
  oyentes.pestana(9, { url: "chrome-extension://abc/bloqueo.html#https://youtube.com/" });
  oyentes.pestana(9, { status: "complete" });
  await espera();
  assert.deepStrictEqual(actualizadas, [[9, "chrome-extension://abc/bloqueo.html#https://www.youtube.com./shorts/abc"]]);

  // 4. La URL original se recupera igual con o sin codificar
  const orig = "https://www.youtube.com/results?search_query=c%2B%2B&x=%26";
  assert.strictEqual(ctx.urlOriginal("#" + orig).href, orig);
  assert.strictEqual(ctx.urlOriginal("#" + encodeURIComponent(orig)).href, orig);
  console.log("Todas las pruebas del fondo pasaron.");
})().catch((e) => { console.error("FALLO:", e.message); process.exit(1); });
