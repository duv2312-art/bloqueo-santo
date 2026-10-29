// Menú del icono: bloquea o desbloquea el sitio de la pestaña actual con un clic.
const $ = (id) => document.getElementById(id);

function mostrar(dominio, detalle) {
  $("dominio").textContent = dominio;
  $("detalle").textContent = detalle;
}

async function guardarYAplicar(sitios) {
  await chrome.storage.sync.set({ sitios });
  try {
    await aplicarReglas();
  } catch (_) {
    // El fondo también aplica las reglas al cambiar la lista
  }
}

// alPulsar se llama sin esperas previas, para que pueda pedir permisos dentro del clic.
// Si devuelve false, el menú se queda abierto (por ejemplo, si se negó el permiso).
function ofrecer(boton, texto, alPulsar) {
  const original = boton.textContent;
  boton.hidden = false;
  boton.addEventListener("click", async () => {
    boton.disabled = true;
    boton.textContent = texto;
    if ((await alPulsar()) === false) {
      boton.disabled = false;
      boton.textContent = original;
      return;
    }
    window.close();
  });
}

async function iniciar() {
  const [pestana] = await chrome.tabs.query({ active: true, currentWindow: true });
  let url;
  try { url = new URL(pestana.url); } catch (_) { url = null; }

  // En la propia página de bloqueo, el sitio original viene en el hash
  let original = null;
  if (url && url.href.startsWith(chrome.runtime.getURL("bloqueo.html"))) {
    try {
      original = urlOriginal(url.hash);
    } catch (_) {
      return mostrar("Bloqueo Santo", "");
    }
  } else if (url && /^https?:$/.test(url.protocol)) {
    original = url;
  } else {
    return mostrar("Esta página", "No se puede bloquear.");
  }

  const host = original.hostname.toLowerCase().replace(/\.$/, "");
  const sitios = await leerSitios();
  const bloqueantes = entradasQueBloquean(host, sitios);

  if (bloqueantes.length) {
    const dominio = bloqueantes[0];
    mostrar(dominio, "Está bloqueado. Este momento es para Dios.");
    // Sitio en la lista pero sin permiso (p. ej. se quitó desde el navegador): el bloqueo no actúa
    if (!(await chrome.permissions.contains(permisoDe(dominio)))) {
      mostrar(dominio, "Está en tu lista, pero falta el permiso para bloquearlo.");
      ofrecer($("permitir"), "Activando…", async () => {
        if (!(await chrome.permissions.request(permisoDe(dominio)))) return false;
        await chrome.tabs.update(pestana.id, { url: urlDeBloqueo(original.href) });
      });
    }
    ofrecer($("desbloquear"), "Desbloqueando…", async () => {
      await guardarYAplicar(sitios.filter((s) => !bloqueantes.includes(s)));
      for (const b of bloqueantes) await soltarPermiso(b);
      // Vuelve a abrir el sitio original, ya sin bloqueo
      await chrome.tabs.update(pestana.id, { url: original.href });
    });
    return;
  }

  const dominio = dominioBase(host);
  mostrar(dominio, "¿Te está robando el tiempo?");
  ofrecer($("bloquear"), "Bloqueando…", async () => {
    // El navegador pide permiso solo para este sitio
    if (!(await chrome.permissions.request(permisoDe(dominio)))) {
      mostrar(dominio, "Sin ese permiso el navegador no deja bloquear el sitio.");
      return false;
    }
    await guardarYAplicar([...sitios, dominio]);
    // Lleva la pestaña directo a la página de bloqueo; el fondo hace lo mismo con
    // las demás pestañas abiertas de ese sitio
    await chrome.tabs.update(pestana.id, { url: urlDeBloqueo(original.href) });
  });
}

$("gestionar").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
  window.close();
});

// Donación voluntaria: solo aparece si el autor configuró su PayPal.me
function abrirDonacion(monto) {
  chrome.tabs.create({ url: enlaceDonacion(monto) });
  window.close();
}

if (CONFIG.paypal) {
  $("cafe").hidden = false;
  $("cafe").addEventListener("click", () => {
    const abierto = !$("donar").hidden;
    $("donar").hidden = abierto;
    $("principal").hidden = !abierto;
  });
  $("volverMenu").addEventListener("click", (e) => {
    e.preventDefault();
    $("donar").hidden = true;
    $("principal").hidden = false;
  });
  for (const m of CONFIG.montos) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = `${m} US$`;
    b.addEventListener("click", () => abrirDonacion(m));
    $("montos").append(b);
  }
  $("otro").addEventListener("submit", (e) => {
    e.preventDefault();
    const m = Math.round(Number($("monto").value));
    if (m >= 1) abrirDonacion(m);
    else $("monto").focus();
  });
}

iniciar();
