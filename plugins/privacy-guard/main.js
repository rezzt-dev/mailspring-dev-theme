const React = require('react');
const { ComponentRegistry, ExtensionRegistry, MessageViewExtension } = require('mailspring-exports');
const { inspectLink, remoteImages } = require('./link-rules');

const h = React.createElement;
const IMAGE_KEY = 'core.reading.autoloadImages';
let active = false;
let previousImageSetting;
let changedImageSetting = false;
const dialogs = new Set();

function dismissDialogs() {
  for (const dialog of dialogs) dialog.remove();
  dialogs.clear();
}

function reviewLink(info) {
  dismissDialogs();
  const dialog = document.createElement('div');
  dialog.className = 'rezzt-privacy-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'revisar enlace');
  const title = document.createElement('strong');
  title.textContent = 'revisar enlace';
  dialog.appendChild(title);
  for (const [label, value] of [['URL real', info.original], ['URL limpia', info.clean]]) {
    const row = document.createElement('p');
    const heading = document.createElement('b');
    heading.textContent = `${label}: `;
    const url = document.createElement('code');
    url.textContent = value;
    row.append(heading, url);
    dialog.appendChild(row);
  }
  const controls = document.createElement('div');
  const button = (label, action) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', () => {
      dismissDialogs();
      if (action) AppEnv.windowEventHandler.openLink({ href: action });
    });
    controls.appendChild(element);
    return element;
  };
  const cancel = button('cancelar');
  button('abrir URL limpia', info.clean);
  button('abrir URL real', info.original);
  dialog.appendChild(controls);
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismissDialogs(); }
  });
  document.body.appendChild(dialog);
  dialogs.add(dialog);
  cancel.focus();
}

class PrivacyMessageExtension extends MessageViewExtension {
  static renderedMessageBodyIntoDocument({ document: frameDocument }) {
    const links = frameDocument.querySelectorAll('a[href]');
    links.forEach((link) => {
      const info = inspectLink(link.getAttribute('href'));
      if (!info || !info.removed.length) return;
      link.classList.add('rezzt-tracking-link');
      link.style.textDecoration = 'underline dotted';
      link.title = `parámetros de seguimiento: ${info.removed.join(', ')} · revisar antes de abrir`;
      const intercept = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        reviewLink(info);
      };
      link.addEventListener('click', intercept, true);
      link.addEventListener('auxclick', intercept, true);
      link.addEventListener('contextmenu', intercept, true);
    });
  }
}

function RemoteImageNotice({ message }) {
  if (!message) return null;
  const { images, possiblePixels } = remoteImages(message.body);
  if (!images) return null;
  const blocked = !AppEnv.config.get(IMAGE_KEY);
  return h('div', { className: 'rezzt-privacy-notice', role: 'status' },
    blocked ? `${images} imagen${images === 1 ? '' : 'es'} remota${images === 1 ? '' : 's'}: carga automática desactivada.`
      : `${images} imagen${images === 1 ? '' : 'es'} remota${images === 1 ? '' : 's'}: carga automática activada.`,
    possiblePixels ? ` ${possiblePixels} posible${possiblePixels === 1 ? '' : 's'} píxel${possiblePixels === 1 ? '' : 'es'} de seguimiento.` : '',
    blocked ? ' Usa el control nativo de Mailspring para mostrar imágenes de este mensaje.' : '');
}

exports.activate = function activate() {
  if (active) return;
  active = true;
  previousImageSetting = AppEnv.config.get(IMAGE_KEY);
  changedImageSetting = previousImageSetting === true;
  if (changedImageSetting) AppEnv.config.set(IMAGE_KEY, false);
  ExtensionRegistry.MessageView.register(PrivacyMessageExtension);
  ComponentRegistry.register(RemoteImageNotice, { role: 'message:BodyHeader' });
};

exports.deactivate = function deactivate() {
  if (!active) return;
  active = false;
  ComponentRegistry.unregister(RemoteImageNotice);
  ExtensionRegistry.MessageView.unregister(PrivacyMessageExtension);
  dismissDialogs();
  if (changedImageSetting && AppEnv.config.get(IMAGE_KEY) === false) {
    AppEnv.config.set(IMAGE_KEY, previousImageSetting);
  }
  changedImageSetting = false;
};
