// Convierte la lista guardada en reglas de redirección hacia la página de bloqueo.
// La usan el fondo (al cambiar la lista) y el menú (para bloquear al instante).
// Una instalación nueva empieza sin ningún sitio bloqueado: la lista la arma el usuario
const SITIOS_INICIALES = [];

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function leerSitios() {
  const { sitios } = await chrome.storage.sync.get("sitios");
  return Array.isArray(sitios) ? sitios : [];
}

// Entradas de la lista que bloquean este host (el dominio o uno de sus padres)
function entradasQueBloquean(host, sitios) {
  host = host.toLowerCase().replace(/\.$/, "");
  return sitios.filter((s) => host === s || host.endsWith("." + s));
}

// Permiso de acceso de un sitio y sus subdominios. La extensión no pide acceso a todos
// los sitios: lo pide sitio por sitio, cuando el usuario lo bloquea (la redirección de
// declarativeNetRequest exige acceso al sitio redirigido).
function permisoDe(dominio) {
  return { origins: [`*://${dominio}/*`, `*://*.${dominio}/*`] };
}

async function soltarPermiso(dominio) {
  try {
    await chrome.permissions.remove(permisoDe(dominio));
  } catch (_) {
    // Si el navegador no lo deja quitar, no afecta: sin la regla ya no se bloquea
  }
}

// La URL original va en el hash tal cual, sin codificar: así llega también desde la regla
function urlDeBloqueo(original) {
  return chrome.runtime.getURL("bloqueo.html") + "#" + original;
}

function urlOriginal(hash) {
  const crudo = hash.replace(/^#/, "");
  try {
    return new URL(crudo);
  } catch (_) {
    // Versiones anteriores la guardaban codificada
    return new URL(decodeURIComponent(crudo));
  }
}

async function aplicarReglas() {
  let { sitios } = await chrome.storage.sync.get("sitios");
  if (!Array.isArray(sitios)) {
    sitios = SITIOS_INICIALES;
    await chrome.storage.sync.set({ sitios });
  }
  const destino = chrome.runtime.getURL("bloqueo.html");
  const nuevas = sitios.map((dominio, i) => ({
    id: i + 1,
    priority: 1,
    action: { type: "redirect", redirect: { regexSubstitution: destino + "#\\0" } },
    condition: {
      regexFilter: "^https?://([a-z0-9-]+\\.)*" + escaparRegex(dominio) + "\\.?([/:?#].*)?$",
      resourceTypes: ["main_frame"],
    },
  }));
  // Quitar también los ids nuevos hace la operación repetible: si el menú y el fondo
  // la ejecutan a la vez, ninguna falla por ids duplicados.
  const viejas = await chrome.declarativeNetRequest.getDynamicRules();
  const quitar = new Set([...viejas.map((r) => r.id), ...nuevas.map((r) => r.id)]);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [...quitar],
    addRules: nuevas,
  });
}
