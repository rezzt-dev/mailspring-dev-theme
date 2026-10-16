# propuesta de plugins para mailspring

## objetivo

El proyecto `mailspring-dev-theme` ya proporciona una identidad visual oscura,
monocroma y consistente para Mailspring. También incluye el plugin
`plugins/short-account-labels`, que simplifica las etiquetas de las cuentas
en el panel lateral sin modificar los datos originales.

El siguiente paso para conseguir un Mailspring más profesional y completo es
añadir extensiones que mejoren el flujo de trabajo, aporten contexto al correo
y den más control sobre la privacidad. Las propuestas están ordenadas por
utilidad y relación con la base actual.

## estado actual

### tema

El tema ya cubre gran parte de la experiencia visual nativa:

- interfaz oscura basada en `#080808`, `#101010` y `#111111`;
- tipografía y jerarquía visual unificadas;
- navegación, lista de mensajes, compositor, preferencias, contactos,
  calendario y notificaciones personalizados;
- estados de error, selección, foco y actividad con una paleta reducida;
- conservación del formato original de los correos HTML recibidos y enviados.

### plugin existente

`short-account-labels` observa el sidebar y reemplaza temporalmente una
dirección como `contacto@rezzt.dev` por `contacto`. Guarda el texto original
y lo restaura al desactivar el plugin, por lo que no renombra cuentas ni cambia
datos del correo.

Es una buena base para plugins ligeros de interfaz. Las siguientes extensiones
deberían usar, cuando sea posible, las APIs de paquetes, componentes, acciones
y stores de Mailspring en lugar de depender únicamente de selectores y
mutaciones del DOM.

## prioridades principales

### 1. centro de productividad y seguimiento

#### propósito

Convertir los correos que requieren una acción en una vista de trabajo clara,
separada de la bandeja de entrada general.

#### funciones propuestas

- detectar mensajes enviados que todavía no han recibido respuesta;
- crear recordatorios de seguimiento con fecha y hora;
- clasificar elementos como `pendiente`, `en espera`, `resuelto` o
  `archivado`;
- mostrar filtros como `requiere respuesta`, `importante` y `sin revisar`;
- añadir acciones rápidas desde la lista y desde la vista del mensaje;
- permitir abrir el correo original desde cada tarea;
- mostrar una sección propia en el sidebar con los elementos pendientes.

#### valor

Es la extensión con mayor impacto diario. Reduce la dependencia de búsquedas
manuales y evita que los mensajes importantes desaparezcan entre correos
informativos.

#### primera versión viable

La primera versión puede limitarse a recordatorios locales y a la detección de
respuestas pendientes. Las tareas completas, estados personalizados y filtros
avanzados pueden añadirse después.

#### riesgo técnico

Medio. Será necesario definir dónde se guarda el estado de cada recordatorio,
cómo se relaciona con un hilo y cómo se actualiza cuando el mensaje cambia de
carpeta o cuenta.

### 2. protección de privacidad y seguridad

#### propósito

Dar al usuario visibilidad y control sobre elementos externos que pueden
seguir su actividad o llevarle a destinos no deseados.

#### funciones propuestas

- avisar antes de cargar imágenes remotas;
- detectar píxeles de seguimiento cuando sea posible;
- marcar enlaces con parámetros habituales de seguimiento como `utm_*` o
  `fbclid`;
- mostrar la URL limpia y la URL real antes de abrir un enlace;
- añadir un indicador de confianza junto al remitente o al enlace;
- permitir configurar las reglas por cuenta;
- mantener un registro local de bloqueos y avisos recientes.

#### valor

Añade una capacidad profesional que no depende de cambiar la estética del
cliente. También encaja con el tratamiento que Mailspring ya hace de la
apertura y el seguimiento de enlaces.

#### primera versión viable

Empezar con avisos de imágenes remotas y limpieza visual de parámetros de
tracking. La detección avanzada de phishing debería quedar para una fase
posterior y presentarse siempre como una señal orientativa, no como una
garantía de seguridad.

#### riesgo técnico

Medio-alto. El contenido de los mensajes está sanitizado y cualquier cambio
debe conservar la seguridad del renderizado. No conviene reimplementar el
sanitizador de Mailspring ni ejecutar análisis externos sin consentimiento.

### 3. panel de contexto del contacto

#### propósito

Mostrar información útil del remitente o destinatario mientras se lee el
mensaje, sin obligar a cambiar de pantalla.

#### funciones propuestas

- fecha de la última interacción;
- número de mensajes intercambiados;
- última respuesta enviada;
- tiempo aproximado de respuesta;
- notas privadas locales;
- etiquetas como `cliente`, `proveedor`, `equipo` o `personal`;
- recordatorio de seguimiento;
- acceso rápido a la ficha de contacto y a conversaciones anteriores.

#### valor

Convierte Mailspring en una herramienta más cercana a un mini CRM y completa
las áreas de contactos, calendario y lectura que el tema ya personaliza.

#### primera versión viable

La primera entrega puede mostrar estadísticas básicas del hilo, notas locales
y etiquetas manuales. La sincronización con servicios externos o la
identificación automática de empresas debería quedar fuera de la primera
versión.

#### riesgo técnico

Medio. Es importante distinguir entre información calculada del correo, datos
del contacto y notas creadas por el usuario, además de evitar mezclar
información entre cuentas distintas.

## mejoras pequeñas y de acabado

### 4. identidades visuales por cuenta

Es la evolución natural de `short-account-labels`:

- alias personalizado para cada cuenta;
- color o indicador visual por identidad;
- inicial o icono personalizado;
- nombre corto configurable;
- etiqueta de contexto como `trabajo`, `personal` o `proyecto`;
- identificación visible de la cuenta usada en el compositor.

La paleta debería respetar el carácter monocromo del tema: blanco, grises y un
color de estado solo cuando aporte información real.

### 5. modo lectura y concentración

Un modo temporal para leer mensajes largos con menos distracciones:

- ocultar el sidebar;
- reducir o esconder la toolbar;
- ampliar el ancho del contenido;
- cambiar entre lectura compacta y cómoda;
- reducir controles secundarios de los hilos;
- activar y desactivar el modo mediante un atajo de teclado.

Es una extensión pequeña, coherente con el enfoque editorial del tema y con un
coste técnico relativamente bajo.

### 6. indicadores visuales de estado

Una capa discreta de información para localizar rápidamente el estado de cada
conversación:

- indicador de mensaje pendiente de respuesta;
- marca de conversación activa o prioritaria;
- señal de presencia de adjuntos;
- distinción entre recibido, enviado y reenviado;
- indicador de hilo antiguo o especialmente largo;
- contador de días desde la última interacción.

La implementación debería evitar llenar la interfaz de colores. En este tema
funcionan mejor pequeños marcadores, líneas, iconos o cambios de contraste.

## hoja de ruta recomendada

### fase 1: mejoras rápidas

1. evolucionar `short-account-labels` hacia `account-identities`;
2. añadir `reading-mode`;
3. añadir indicadores básicos de adjuntos y seguimiento.

Estas extensiones permiten validar convenciones comunes para configuración,
activación, estilos y compatibilidad sin introducir todavía almacenamiento
complejo.

### fase 2: productividad

1. crear el modelo local de recordatorios;
2. implementar `focus-and-follow-up`;
3. añadir filtros y acciones desde la lista de mensajes;
4. integrar el panel de pendientes con el sidebar.

Esta fase debería probarse con varios perfiles y cuentas para evitar que un
recordatorio se muestre en la cuenta equivocada.

### fase 3: privacidad y contexto

1. implementar avisos de imágenes remotas;
2. añadir detección y limpieza de parámetros de tracking;
3. construir el panel `contact-context`;
4. añadir notas y etiquetas locales;
5. documentar claramente qué datos se procesan y dónde se almacenan.

## criterios comunes de diseño

Todos los plugins deberían cumplir estas reglas:

- respetar la paleta y los roles definidos en `styles/ui-variables.less`;
- no modificar el HTML original del mensaje salvo que sea imprescindible;
- mantener intactos los datos de las cuentas y de los correos;
- ofrecer una desactivación limpia mediante `deactivate()`;
- restaurar el DOM si se han hecho cambios visuales temporales;
- evitar dependencias externas innecesarias;
- guardar la información local de forma separada por cuenta cuando corresponda;
- funcionar correctamente con sidebar, compositor y vista de mensaje
  redimensionados;
- documentar instalación, limitaciones y comportamiento de privacidad.

## arquitectura recomendada

Para cambios sencillos de presentación se puede mantener un enfoque parecido
al de `short-account-labels`, con observadores limitados y selectores muy
concretos.

Para las extensiones principales conviene usar la arquitectura de plugins de
Mailspring:

- componentes para paneles, botones y vistas propias;
- acciones para responder a cambios del usuario;
- stores o modelos para estado observable;
- estilos propios del plugin para no sobrecargar el tema;
- ciclo de vida `activate()` y `deactivate()` para registrar y limpiar
  listeners.

La documentación oficial describe Mailspring como una aplicación extensible
por paquetes y ofrece una plantilla con ejemplos de componentes para la barra
de acciones del compositor y el panel lateral del mensaje:

- [Mailspring Plugin Starter](https://github.com/Foundry376/Mailspring-Plugin-Starter)
- [arquitectura del sistema de plugins](https://github.com/Foundry376/Mailspring/blob/master/PLUGIN_SYSTEM_ARCHITECTURE.md)
- [guía de paquetes de Mailspring](https://foundry376.github.io/Mailspring/guides/PackageOverview.html)

## conclusión

La combinación con mayor equilibrio entre utilidad, identidad y esfuerzo es:

1. `account-identities`, como evolución inmediata del plugin existente;
2. `focus-and-follow-up`, como función principal de productividad;
3. `privacy-guard`, como elemento diferenciador profesional;
4. `contact-context`, como ampliación de alto valor para usuarios avanzados;
5. `reading-mode` e `indicators`, como pulido visual y de uso diario.

Este orden permite empezar con extensiones pequeñas y coherentes con el tema,
validar la arquitectura y terminar construyendo una experiencia de correo más
completa sin convertir el proyecto en un conjunto de modificaciones frágiles
del DOM.
