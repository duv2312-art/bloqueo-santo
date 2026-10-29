# Pestaña "Prácticas de privacidad" del Chrome Web Store

Textos listos para copiar en cada campo.

## Propósito único
Bloquear los sitios web que el usuario elige y mostrar en su lugar una página de bloqueo con una cita espiritual católica (Escritura, Catecismo, santos) para ayudarle a no distraerse.

## Justificación de permisos

**declarativeNetRequest**
Se usa para redirigir a la página de bloqueo de la extensión los sitios que el usuario añadió a su lista. Las reglas se crean a partir de esa lista y el navegador las aplica de forma local. La extensión no lee ni modifica el contenido de las páginas.

**storage**
Guarda la lista de sitios bloqueados del usuario y una lista corta de las últimas citas mostradas, para no repetirlas.

**activeTab**
Cuando el usuario pulsa el icono, se lee la dirección de la pestaña actual para ofrecerle bloquear o desbloquear ese sitio.

**Permisos de host opcionales (optional_host_permissions)**
La extensión no tiene acceso a ningún sitio al instalarse. Cuando el usuario bloquea un sitio, se pide con chrome.permissions.request acceso solo a ese dominio y a sus subdominios (por ejemplo *://instagram.com/* y *://*.instagram.com/*), porque la acción de redirección de declarativeNetRequest exige acceso de host a la URL redirigida. Al desbloquearlo, el permiso se devuelve con chrome.permissions.remove. Con ese acceso también se lee la dirección de las pestañas de ese sitio, para llevar a la página de bloqueo las que ya estaban abiertas y las que vuelven a él con la navegación interna o con el botón Atrás. No se inyectan scripts, no se lee el contenido de ninguna página y las direcciones no se guardan ni se envían.

**history (opcional; se pide solo si el usuario lo activa en los ajustes)**
Borra del historial las visitas a la propia página de bloqueo de la extensión (chrome-extension://…/bloqueo.html), para que no aparezca entre los sitios frecuentes de la página de nueva pestaña. Solo se buscan, en el equipo, las entradas cuya dirección contiene el identificador de la extensión; ningún otro dato del historial se guarda ni se envía.

## ¿Usa código remoto?
No. Todo el código va incluido en el paquete.

## Uso de datos
No se marca ninguna categoría: la extensión no recoge datos de los usuarios.

Certificaciones (marcar las tres):
- No vendo ni transfiero datos de usuarios a terceros, salvo en los casos de uso aprobados.
- No uso ni transfiero datos de usuarios con fines no relacionados con el propósito único del elemento.
- No uso ni transfiero datos de usuarios para determinar la solvencia crediticia ni para conceder préstamos.
