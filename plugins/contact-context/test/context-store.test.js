const test = require('node:test');
const assert = require('node:assert/strict');
const { ContextStore } = require('../context-store');

test('notes remain scoped to both account and normalized email', () => {
  let raw;
  let observer;
  const config = {
    observe: (_, callback) => { observer = callback; callback(raw); return { dispose() {} }; },
    set: (_, value) => { raw = JSON.parse(JSON.stringify(value)); observer(raw); return true; },
  };
  const store = new ContextStore(config);
  store.start();
  store.save('a', ' PERSON@example.com ', { note: 'privado', tags: ['Cliente', 'cliente', 'Equipo'] });
  assert.deepEqual(store.get('a', 'person@example.com'), { note: 'privado', tags: ['cliente', 'equipo'] });
  assert.deepEqual(store.get('b', 'person@example.com'), { note: '', tags: [] });
  store.save('b', 'person@example.com', { note: 'otra cuenta', tags: [] });
  store.save('a', 'person@example.com', { note: '', tags: [] });
  assert.equal(store.get('a', 'person@example.com').note, '');
  assert.equal(store.get('b', 'person@example.com').note, 'otra cuenta');
  store.stop();
});
