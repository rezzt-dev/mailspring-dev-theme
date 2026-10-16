const React = require('react');
const { ComponentRegistry } = require('mailspring-exports');

const listeners = new Set();
let enabled = false;
let density = 'comfortable';
let observer = null;
let active = false;

function updateDocument() {
  if (typeof document === 'undefined') return;
  const visible = enabled && !!document.querySelector('#message-list');
  document.body.classList.toggle('rezzt-reading-mode', visible);
  document.body.classList.toggle('rezzt-reading-compact', visible && density === 'compact');
  listeners.forEach((listener) => listener());
}

function toggleMode() {
  enabled = !enabled;
  updateDocument();
}

function toggleDensity() {
  density = density === 'comfortable' ? 'compact' : 'comfortable';
  updateDocument();
}

function onKeyDown(event) {
  if (!event.shiftKey || !(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== 'r') return;
  if (!document.querySelector('#message-list')) return;
  const target = event.target;
  if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"], .composer-inner-wrap')) return;
  event.preventDefault();
  event.stopPropagation();
  toggleMode();
}

class ReadingModeControls extends React.Component {
  componentDidMount() {
    this.refresh = () => this.forceUpdate();
    listeners.add(this.refresh);
  }

  componentWillUnmount() {
    listeners.delete(this.refresh);
  }

  render() {
    return React.createElement('div', { className: 'rezzt-reading-controls' },
      React.createElement('button', {
        type: 'button',
        onClick: toggleMode,
        'aria-pressed': enabled,
        title: 'modo lectura (ctrl/cmd+mayús+r)',
      }, enabled ? 'salir del modo lectura' : 'modo lectura'),
      enabled && React.createElement('button', {
        type: 'button',
        onClick: toggleDensity,
        'aria-label': `lectura ${density}; cambiar densidad`,
        title: 'cambiar entre lectura cómoda y compacta',
      }, density === 'comfortable' ? 'cómoda' : 'compacta'));
  }
}

exports.activate = function activate() {
  if (active) return;
  active = true;
  ComponentRegistry.register(ReadingModeControls, { role: 'MessageListHeaders' });
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  document.addEventListener('keydown', onKeyDown, true);
  observer = new MutationObserver(() => {
    const shouldBeVisible = enabled && !!document.querySelector('#message-list');
    if (document.body.classList.contains('rezzt-reading-mode') !== shouldBeVisible) updateDocument();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

exports.deactivate = function deactivate() {
  if (!active) return;
  active = false;
  ComponentRegistry.unregister(ReadingModeControls);
  if (observer) observer.disconnect();
  observer = null;
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onKeyDown, true);
    document.body.classList.remove('rezzt-reading-mode', 'rezzt-reading-compact');
  }
  enabled = false;
  density = 'comfortable';
  listeners.clear();
};
