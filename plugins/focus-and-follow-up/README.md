# FOCUS AND FOLLOW UP

centro local de productividad para mailspring: recordatorios por conversación,
detección de respuestas pendientes, filtros y panel de seguimiento.

## INSTALACION

en mailspring, abre `developer → install a package manually...` y selecciona
`plugins/focus-and-follow-up`. reinicia la aplicación si se solicita. el plugin
funciona en la ventana principal y no necesita servicios externos.

## USO

- en la lista de mensajes, usa `+` para recordar un hilo mañana a las 09:00;
  si ya está pendiente, `✓` lo marca como resuelto.
- encima de una conversación, elige una fecha y hora exactas y pulsa
  `recordar` o `actualizar`. el selector de estado permite `pendiente`,
  `en espera`, `resuelto` y `archivado`.
- en la barra de la lista, usa `requiere respuesta`, `importante`,
  `sin revisar` o `pendientes`. `volver` recupera la vista anterior.
- en el panel lateral, cambia entre las cuentas visibles o una cuenta concreta,
  abre el correo original, cambia su estado o quita un recordatorio. las
  sugerencias de hilos enviados sin respuesta se pueden convertir en
  recordatorios.

el filtro `importante` incluye hilos destacados con estrella o con la categoría
de importancia de mailspring. `sin revisar` usa el estado de no leído. el
filtro `requiere respuesta` compara las fechas del último envío y de la última
recepción del hilo.

## MODELO LOCAL Y PRIVACIDAD

los recordatorios se guardan en la configuración local de mailspring bajo
`focus-and-follow-up.records`, separados primero por identificador de cuenta y
después por identificador de hilo. cada registro contiene asunto, fecha de
aviso, estado y marcas de tiempo. los datos del correo no se modifican ni se
envían a otro servicio. al abrir un recordatorio, el plugin comprueba de nuevo
que el hilo pertenece a la cuenta guardada.

una respuesta posterior al último envío marca automáticamente como resuelto un
recordatorio en estado `en espera`. los recordatorios en estado `pendiente`
siguen bajo control manual. si un hilo se mueve de carpeta, su identificador
y su recordatorio permanecen relacionados. al eliminar un hilo o una cuenta,
el registro local se conserva hasta quitarlo manualmente y no se muestra en
otra cuenta.

## LIMITACIONES

la detección automática revisa, en cada actualización, los 1000 hilos enviados
más recientes de los últimos 180 días disponibles en la base local de
mailspring. un hilo más antiguo puede añadirse manualmente, pero no aparecerá
como sugerencia automática. la comparación de fechas es una señal de respuesta
pendiente; no interpreta el contenido del correo ni puede saber si una
respuesta externa ya resolvió el asunto. los avisos vencidos se muestran en el
panel y la lista; esta versión no genera notificaciones del sistema.

al desactivar el plugin se retiran los componentes y listeners. los
recordatorios locales se conservan para poder recuperarlos al activarlo de
nuevo.
