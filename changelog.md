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

#### CAMBIOS
- rehacer las superficies, controles, navegacion, listas, mensajes, compositor, preferencias, contactos, calendario y notificaciones con el sistema editorial monocromo de `rezzt.dev`
- fijar toda la interfaz nativa en `gilroy`, 12px y minusculas y ampliar hasta 360px el ancho maximo del panel lateral sin alterar el formato de los correos recibidos ni redactados
- actualizar los metadatos del paquete a `rezzt.dev editorial dark` en la version `1.1.0` para identificar el nuevo sistema visual en mailspring
- documentar en los ficheros de diseño la sobrescritura tipografica especifica de mailspring sobre las reglas generales de la web
- oscurecer la paleta monocroma con el lienzo `#080808`, superficies `#101010` y `#111111`, y estados interactivos `#242424` para reforzar la profundidad visual del tema
- actualizar `readme.md` con los nuevos colores base del sistema visual

### ENGLISH

#### ADDED
- create the `dev-dark` theme for `mailspring` with a monochrome palette based on the `rezzt.dev` visual system and `nexus dark`
- define less variables for surfaces, text, states, controls, navigation and message lists with consistent contrast
- customize the compose and message-reading interface, menus, modals and buttons with flat surfaces and subtle separators
- use `gilroy` as the native interface's only font without redistributing its commercial font files or changing received html email formatting
- document installation, visual principles, the mit license and the theme file structure
- add a mailspring plugin to show only the text before `@` in sidebar account labels without changing the original account names

#### CHANGED
- rebuild surfaces, controls, navigation, lists, messages, composer, preferences, contacts, calendar and notifications with the monochrome `rezzt.dev` editorial system
- set the entire native interface to `gilroy`, 12px and lowercase and raise the sidebar maximum width to 360px without changing received or authored email formatting
- update the package metadata to `rezzt.dev editorial dark` at version `1.1.0` to identify the new visual system in mailspring
- document the mailspring-specific typography override over the website's general design rules in the design files
- darken the monochrome palette with the `#080808` canvas, `#101010` and `#111111` surfaces, and `#242424` interactive states to reinforce the theme's visual depth
- update `readme.md` with the visual system's new base colors
