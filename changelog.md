# CHANGELOG

## SIN PUBLICAR / UNRELEASED

### CASTELLANO

#### NUEVO
- crear el tema oscuro `dev-dark` para `mailspring` con una paleta monocroma basada en el sistema visual de `rezzt.dev` y `nexus dark`
- definir las variables less para superficies, texto, estados, controles, navegacion y listas de mensajes con contraste consistente
- personalizar la interfaz de composicion y lectura de correos, los menus, modales y botones con superficies planas y separadores sutiles
- usar `gilroy` como fuente unica de la interfaz nativa sin redistribuir sus archivos comerciales ni modificar el formato de los correos html recibidos
- documentar la instalacion, los principios visuales, la licencia mit y la estructura de los archivos del tema
- añadir un complemento de mailspring para mostrar solo el texto anterior a `@` en las etiquetas de cuenta del panel lateral sin cambiar los nombres originales
- añadir `account-identities` para configurar alias, iniciales, contexto e indicadores por cuenta y mostrar la identidad activa en el compositor
- añadir `reading-mode` para ocultar paneles laterales, ampliar el area de lectura y alternar entre densidad comoda y compacta
- añadir `focus-and-follow-up` con recordatorios locales, deteccion de respuestas pendientes, estados de seguimiento y panel de pendientes
- añadir `privacy-guard` para avisar sobre imagenes remotas, detectar posibles pixeles de seguimiento y revisar enlaces con parametros de tracking
- añadir `contact-context` para mostrar estadisticas del hilo y gestionar notas privadas y etiquetas locales por cuenta y contacto

#### CAMBIOS
- unificar la toolbar y su barra de seleccion en `#101010`, eliminar los cortes entre columnas y aplicar la inversion completa de texto e iconos en sus controles
- centralizar los roles de superficie y estado en `styles/ui-variables.less`, mejorar el contraste de metadatos y normalizar recordatorios, notas y errores en toda la interfaz
- actualizar `readme.md` con la asignacion de tonos para lienzo, paneles, popovers, campos y estados interactivos
- rehacer las superficies, controles, navegacion, listas, mensajes, compositor, preferencias, contactos, calendario y notificaciones con el sistema editorial monocromo de `rezzt.dev`
- fijar toda la interfaz nativa en `gilroy`, 12px y minusculas y ampliar hasta 360px el ancho maximo del panel lateral sin alterar el formato de los correos recibidos ni redactados
- actualizar los metadatos del paquete a `rezzt.dev editorial dark` en la version `1.1.0` para identificar el nuevo sistema visual en mailspring
- documentar en los ficheros de diseño la sobrescritura tipografica especifica de mailspring sobre las reglas generales de la web
- oscurecer la paleta monocroma con el lienzo `#080808`, superficies `#101010` y `#111111`, y estados interactivos `#242424` para reforzar la profundidad visual del tema
- actualizar `readme.md` con los nuevos colores base del sistema visual
- evolucionar `short-account-labels` a `account-identities` y restaurar el texto original al desactivar el complemento
- aplicar los alias de `account-identities` al menu de seleccion del remitente, conservar la direccion completa en el titulo y restaurar el contenido original al desactivar el complemento
- configurar las ocho cuentas importadas en `plugins/account-identities/identities.json` con alias, iniciales, indicadores y contexto editables
- añadir una prueba del menu de remitente en `plugins/account-identities/test/main.test.js`
- destacar los indicadores nativos de adjuntos y recordatorios de seguimiento con marcadores monocromos en `styles/thread-list.less`
- integrar filtros de productividad para `requiere respuesta`, `importante`, `sin revisar` y `pendientes` con acciones rapidas desde la lista y la vista del mensaje
- separar los recordatorios por `accountId` y `threadId`, conservarlos en la configuracion local y comprobar la cuenta antes de abrir el correo original
- añadir pruebas para la deteccion de respuestas, la resolucion automatica y el aislamiento de recordatorios entre cuentas en `plugins/focus-and-follow-up/test/focus-store.test.js`
- documentar la instalacion, el uso, las limitaciones y el tratamiento local de datos de los nuevos complementos
- actualizar la documentacion de `plugins/account-identities/README.md` con el funcionamiento del menu de remitente y el formato JSON de configuracion

#### SEGURIDAD
- bloquear la carga automatica de imagenes mediante la preferencia nativa de `mailspring` y mostrar la url real y la url limpia antes de abrir enlaces con parametros conocidos de seguimiento
- mantener las notas y etiquetas de `contact-context` en la configuracion local, separadas por `accountId` y direccion de correo, sin sincronizarlas ni enviarlas a servicios externos

### ENGLISH

#### ADDED
- create the `dev-dark` theme for `mailspring` with a monochrome palette based on the `rezzt.dev` visual system and `nexus dark`
- define less variables for surfaces, text, states, controls, navigation and message lists with consistent contrast
- customize the compose and message-reading interface, menus, modals and buttons with flat surfaces and subtle separators
- use `gilroy` as the native interface's only font without redistributing its commercial font files or changing received html email formatting
- document installation, visual principles, the mit license and the theme file structure
- add a mailspring plugin to show only the text before `@` in sidebar account labels without changing the original account names
- add `privacy-guard` to warn about remote images, detect possible tracking pixels, and review links with tracking parameters
- add `contact-context` to show thread statistics and manage private notes and local tags per account and contact

#### CHANGED
- unify the toolbar and selection overlay on `#101010`, remove column color breaks, and apply complete text and icon inversion to toolbar controls
- centralize surface and state roles in `styles/ui-variables.less`, improve metadata contrast, and normalize reminders, notes, and errors throughout the interface
- update `readme.md` with the color assignment for canvas, panels, popovers, fields, and interactive states
- rebuild surfaces, controls, navigation, lists, messages, composer, preferences, contacts, calendar and notifications with the monochrome `rezzt.dev` editorial system
- set the entire native interface to `gilroy`, 12px and lowercase and raise the sidebar maximum width to 360px without changing received or authored email formatting
- update the package metadata to `rezzt.dev editorial dark` at version `1.1.0` to identify the new visual system in mailspring
- document the mailspring-specific typography override over the website's general design rules in the design files
- darken the monochrome palette with the `#080808` canvas, `#101010` and `#111111` surfaces, and `#242424` interactive states to reinforce the theme's visual depth
- update `readme.md` with the visual system's new base colors
- evolve `short-account-labels` into `account-identities` and restore the original label when the plugin is deactivated
- apply `account-identities` aliases to the sender selection menu, preserve the full address in the title, and restore the original content when the plugin is deactivated
- configure the eight imported accounts in `plugins/account-identities/identities.json` with editable aliases, initials, indicators, and context
- add a sender menu test in `plugins/account-identities/test/main.test.js`
- emphasize native attachment and follow-up reminder indicators with monochrome markers in `styles/thread-list.less`
- add productivity filters for `requires reply`, `important`, `unreviewed` and `pending` with quick actions from the thread list and message view
- scope reminders by `accountId` and `threadId`, persist them in local configuration, and verify the account before opening the original email
- add tests for reply detection, automatic resolution, and cross-account reminder isolation in `plugins/focus-and-follow-up/test/focus-store.test.js`
- document installation, usage, limitations, and local data handling for the new plugins
- update `plugins/account-identities/README.md` with sender menu behavior and the JSON configuration format

#### SECURITY
- block automatic image loading through Mailspring's native preference and show the real and cleaned URLs before opening links with known tracking parameters
- keep `contact-context` notes and tags in local configuration, separated by `accountId` and email address, without syncing or sending them to external services
