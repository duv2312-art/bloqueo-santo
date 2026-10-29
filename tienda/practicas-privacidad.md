# Pestaña "Prácticas de privacidad" del Chrome Web Store

Textos listos para copiar en cada campo.

## Propósito único
Bloquear los sitios web que el usuario elige y mostrar en su lugar una página de bloqueo con una cita espiritual católica (Escritura, Catecismo, santos) para ayudarle a no distraerse.

## Justificación de permisos

**declarativeNetRequest**
Se usa para redirigir a la página de bloqueo de la extensión los sitios que el usuario añadió a su lista. Las reglas se crean a partir de esa lista y el navegador las aplica de forma local. La extensión no lee ni modifica el contenido de las páginas.

**storage**
Guarda la lista de sitios bloqueados del usuario y una lista corta de las últimas citas mostradas, para no repetirlas.

**Permiso de host (<all_urls>)**
El usuario puede bloquear cualquier sitio que elija, y la acción de redirección de declarativeNetRequest exige acceso de host a la URL redirigida. El mismo acceso permite leer la dirección de las pestañas para tres cosas: llevar a la página de bloqueo las pestañas ya abiertas de un sitio recién bloqueado y las que vuelven a él con la navegación interna o con el botón Atrás; y, al pulsar el icono, ofrecer bloquear o desbloquear la pestaña actual. Las direcciones se comparan en el equipo con la lista del usuario y no se guardan ni se envían. No se inyectan scripts ni se lee el contenido de ninguna página.

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
