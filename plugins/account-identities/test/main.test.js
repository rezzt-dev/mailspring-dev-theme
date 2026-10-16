const assert = require('node:assert/strict');
const test = require('node:test');
const Module = require('node:module');

test('composer sender menu uses aliases and restores the original contact', async () => {
  const originalLoad = Module._load;
  const email = 'contacto@rezzt.dev';
  const contact = { email, toString: () => `Contacto <${email}>` };
  const accountStore = {
    accounts: () => [{ emailAddress: email, label: email }],
    aliasesFor: () => [contact],
    listen: () => () => {},
  };
  const registry = { register() {}, unregister() {} };
  const row = {
    textContent: contact.toString(),
    attributes: new Map(),
    getAttribute(name) { return this.attributes.get(name) ?? null; },
    setAttribute(name, value) { this.attributes.set(name, value); },
    removeAttribute(name) { this.attributes.delete(name); },
  };
  const observers = [];
  const previousDocument = global.document;
  const previousObserver = global.MutationObserver;
  global.document = {
    body: {},
    querySelector: () => null,
    querySelectorAll: (selector) => selector.includes('.contact') ? [row] : [],
  };
  global.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() {}
  };
  Module._load = function (request, parent, isMain) {
    if (request === 'react') return { createElement: () => null };
    if (request === './identities.json') {
      return { [email]: { alias: 'rezzt', context: 'trabajo' } };
    }
    if (request === 'mailspring-exports') {
      return { AccountStore: accountStore, ComponentRegistry: registry };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const pluginPath = require.resolve('../main');
    delete require.cache[pluginPath];
    const plugin = require(pluginPath);
    plugin.activate();
    await Promise.resolve();
    assert.equal(row.textContent, 'rezzt · trabajo');
    assert.equal(row.getAttribute('title'), contact.toString());
    assert.equal(row.getAttribute('aria-label'), contact.toString());

    row.textContent = 'Otra persona <otra@example.com>';
    observers[0].callback([{
      target: { nodeType: 1, closest: () => true },
      addedNodes: [],
    }]);
    await Promise.resolve();
    assert.equal(row.textContent, 'Otra persona <otra@example.com>');

    row.textContent = contact.toString();
    observers[0].callback([{
      target: { nodeType: 1, closest: () => true },
      addedNodes: [],
    }]);
    await Promise.resolve();
    plugin.deactivate();
    assert.equal(row.textContent, contact.toString());
    assert.equal(row.getAttribute('title'), null);
    assert.equal(row.getAttribute('aria-label'), null);
  } finally {
    Module._load = originalLoad;
    global.document = previousDocument;
    global.MutationObserver = previousObserver;
    delete require.cache[require.resolve('../main')];
  }
});
