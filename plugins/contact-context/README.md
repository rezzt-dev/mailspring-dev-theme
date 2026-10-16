# CONTACT CONTEXT

Panel local de contexto de contacto para la vista de mensajes de Mailspring.

## INSTALACIÓN Y USO

Instala `plugins/contact-context` con `developer → install a package manually...`.
En el panel lateral de un hilo, selecciona un participante. El panel muestra el
número de mensajes de ese participante en el hilo abierto, la última
interacción y el último mensaje enviado en ese mismo hilo. También permite
guardar una nota privada y hasta ocho etiquetas manuales. `guardar` persiste
los cambios; dejar vacíos ambos campos elimina el registro local.

## DATOS Y PRIVACIDAD

Notas y etiquetas se guardan en la configuración local de Mailspring, en
`contact-context.records`, indexadas por identificador de cuenta y dirección
en minúsculas. Las notas admiten 4000 caracteres; cada etiqueta, 32. No se
añaden al contacto sincronizado ni a los mensajes, y no se envían a ningún
servicio externo. Las estadísticas se calculan al abrir el hilo con los
mensajes que Mailspring ya cargó. No representan el historial completo de la
persona, y no se mezclan mensajes de otras cuentas. Al desactivar el plugin,
se retira el panel y sus listeners; los registros locales se conservan para
una activación posterior.
