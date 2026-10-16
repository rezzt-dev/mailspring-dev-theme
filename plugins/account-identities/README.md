# ACCOUNT IDENTITIES

presenta alias e indicadores discretos por cuenta en el panel lateral, junto
al remitente del compositor y en su menú de selección. no modifica el nombre,
la dirección ni los datos de la cuenta.

## INSTALACION

en mailspring, abre `developer → install a package manually...` y selecciona
la carpeta `plugins/account-identities`. si estaba instalado
`short-account-labels`, desactívalo para evitar que ambos plugins modifiquen la
misma cabecera. reinicia la aplicación si se solicita.

## CONFIGURACION

edita `identities.json` antes de instalar o reinicia mailspring después de
cambiarlo. usa una clave por dirección de cuenta en minúsculas:

```json
{
  "contacto@rezzt.dev": {
    "alias": "rezzt",
    "initial": "r",
    "indicator": "white",
    "context": "trabajo"
  }
}
```

`alias` define el nombre corto; `initial` acepta hasta dos caracteres;
`indicator` admite `white`, `gray` y `dim`; `context` añade una etiqueta breve.
si no hay entrada, se muestra la parte anterior a `@` y su inicial. la
dirección completa sigue disponible en el título al pasar el cursor por las
cabeceras y las opciones del menú de remitente. el archivo debe contener JSON
válido; usa `{}` si todavía no quieres configurar ninguna cuenta.

## LIMITACIONES Y PRIVACIDAD

las identidades se guardan solo en el archivo local del plugin y se relacionan
por dirección de cuenta. los alias de envío de una misma cuenta usan la
dirección activa para buscar su configuración. las cabeceras del panel lateral
se reconocen por la etiqueta original de mailspring; si dos cuentas tienen la
misma etiqueta, solo puede identificarse la primera con este método. al
desactivar el plugin se restauran el texto y el título originales. no se
transmiten datos ni se modifica el contenido de los correos.
