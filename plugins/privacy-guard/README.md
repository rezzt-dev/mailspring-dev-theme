# PRIVACY GUARD

Avisos locales de imágenes remotas y revisión de enlaces con parámetros de
seguimiento en la vista de mensajes de Mailspring.

## INSTALACIÓN Y USO

Instala `plugins/privacy-guard` con `developer → install a package manually...`.
Reinicia Mailspring si lo solicita. Al activarse, el plugin desactiva la opción
nativa `core.reading.autoloadImages` si estaba activa. Mailspring bloquea las
imágenes remotas y muestra sus propios controles para permitirlas por mensaje o
remitente. El aviso del plugin indica cuántas etiquetas `<img>` con URL remota
detecta en el cuerpo y señala posibles píxeles de 1 px. Es una pista, no una
clasificación fiable de rastreadores.

Los enlaces HTTP(S) con `utm_*`, `fbclid`, `gclid`, `msclkid` y otros parámetros
conocidos se marcan en el mensaje. Al pulsar uno, aparece su URL real y una
versión que elimina solo esos parámetros. El usuario decide cuál abrir o puede
cancelar. El HTML original, el destino guardado en el correo y los demás
parámetros no se cambian. Los enlaces sin esos parámetros conservan el
comportamiento normal de Mailspring.

## DATOS Y LÍMITES

El análisis ocurre en el equipo, sin peticiones de red ni registro de URLs.
El plugin solo cambia la preferencia local de carga automática de imágenes.
Al desactivarlo, restaura su valor anterior si aún está desactivada; los
permisos de remitentes que el usuario otorgue mediante el control nativo de
Mailspring permanecen en Mailspring. El contador solo examina etiquetas
`<img src="https://...">`: estilos CSS, redirecciones y enlaces opacos pueden
incluir seguimiento no detectado. Abrir una URL limpia puede seguir revelando
información al sitio de destino. Los enlaces abiertos desde otros controles de
Mailspring, como el menú nativo del correo, no pasan por este aviso.
