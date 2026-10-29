// Mantiene las reglas de bloqueo sincronizadas con la lista guardada.
importScripts("reglas.js");

// Encadena las actualizaciones para que dos cambios seguidos no se pisen
let cola = Promise.resolve();
function encolar() {
  cola = cola.then(aplicarReglas, aplicarReglas);
  return cola;
}

// Las reglas actúan sobre peticiones de red. Esto cubre lo que no pasa por la red:
// pestañas ya abiertas al bloquear, navegación interna de sitios de una sola página
// y el botón Atrás cuando el navegador trae la página de su caché.
async function redirigirSiBloqueada(tabId, url) {
  let u;
  try { u = new URL(url); } catch (_) { return; }
  if (!/^https?:$/.test(u.protocol)) return;
  if (entradasQueBloquean(u.hostname, await leerSitios()).length) {
    chrome.tabs.update(tabId, { url: urlDeBloqueo(u.href) });
  }
}

chrome.tabs.onUpdated.addListener((tabId, cambio) => {
  if (cambio.url) redirigirSiBloqueada(tabId, cambio.url);
});

async function redirigirPestanasAbiertas() {
  for (const t of await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] })) {
    if (t.url) redirigirSiBloqueada(t.id, t.url);
  }
}

// Opcional (si el usuario concede el permiso de historial): la página de bloqueo
// no queda en el historial ni aparece como sitio frecuente.
const PROPIA = chrome.runtime.getURL("");
let vigilando = false;

function vigilarHistorial() {
  if (vigilando || !chrome.history) return;
  vigilando = true;
  chrome.history.onVisited.addListener(({ url }) => {
    if (url && url.startsWith(PROPIA)) chrome.history.deleteUrl({ url });
  });
}

async function limpiarHistorial() {
  if (!chrome.history) return;
  // Busca solo las entradas con el identificador de la extensión en la dirección
  const visitas = await chrome.history.search({ text: chrome.runtime.id, startTime: 0, maxResults: 10000 });
  for (const { url } of visitas) {
    if (url && url.startsWith(PROPIA)) await chrome.history.deleteUrl({ url });
  }
}

vigilarHistorial();

chrome.permissions.onAdded.addListener(({ permissions }) => {
  if (permissions && permissions.includes("history")) {
    vigilarHistorial();
    limpiarHistorial();
  }
});

function alArrancar() {
  encolar();
  limpiarHistorial();
}

chrome.runtime.onInstalled.addListener(alArrancar);
chrome.runtime.onStartup.addListener(alArrancar);
chrome.storage.onChanged.addListener((cambios, area) => {
  if (area === "sync" && cambios.sitios) {
    encolar();
    redirigirPestanasAbiertas();
  }
});
