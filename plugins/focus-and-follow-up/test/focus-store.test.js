const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { FocusStore, needsReply, defaultDueAt } = require('../focus-store');

const NOW = new Date('2026-10-16T10:00:00.000Z');

function thread(accountId, id, sent, received) {
  return {
    accountId, id, subject: `${accountId} subject`, inAllMail: true,
    lastMessageSentTimestamp: sent && new Date(sent),
    lastMessageReceivedTimestamp: received && new Date(received),
  };
}

function fixture() {
  const values = new Map();
  const observers = new Map();
  let recent = [];
  let tracked = [];
  const config = {
    observe(key, callback) {
      observers.set(key, callback);
      callback(values.get(key));
      return { dispose: () => observers.delete(key) };
    },
    set(key, value) {
      const copy = JSON.parse(JSON.stringify(value));
      values.set(key, copy);
      if (observers.has(key)) observers.get(key)(copy);
      return true;
    },
  };
  const database = {
    listen: () => () => {},
    findAll() {
      const query = {
        matchers: [],
        where(matcher) { this.matchers.push(matcher); return this; },
        order() { return this; },
        limit() { return this; },
        then(resolve, reject) {
          const result = this.matchers.some((matcher) => matcher && matcher.id)
            ? tracked : recent;
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const Thread = { attributes: { lastMessageSentTimestamp: {
    greaterThan: () => ({}), descending: () => ({}),
  } } };
  const accountStore = {
    accounts: () => [{ id: 'a' }, { id: 'b' }],
    listen: () => () => {},
  };
  const store = new FocusStore({ config, database, Thread, accountStore, now: () => NOW });
  store.load({ version: 1, accounts: {} });
  return { store, config, values, setRecent: (items) => { recent = items; },
    setTracked: (items) => { tracked = items; } };
}

test('reply detection compares timestamps and excludes removed mail', () => {
  assert.equal(needsReply(thread('a', 'x', '2026-10-16T09:00:00Z', '2026-10-15T09:00:00Z')), true);
  assert.equal(needsReply(thread('a', 'x', '2026-10-15T09:00:00Z', '2026-10-16T09:00:00Z')), false);
  assert.equal(needsReply({ ...thread('a', 'x', '2026-10-16T09:00:00Z'), inAllMail: false }), false);
  assert.ok(new Date(defaultDueAt(NOW)).getTime() > NOW.getTime());
});

test('records and filters stay scoped by account even with the same thread id', () => {
  const { store, values } = fixture();
  const sameA = thread('a', 'same', '2026-10-16T09:00:00Z', '2026-10-15T09:00:00Z');
  const sameB = thread('b', 'same', '2026-10-16T09:00:00Z', '2026-10-15T09:00:00Z');
  store.track(sameA, '2026-10-17T09:00:00Z');
  assert.equal(store.get('b', 'same'), null);
  assert.deepEqual(store.filterKeys('pending', ['b']), []);
  store.track(sameB, '2026-10-18T09:00:00Z');
  store.setStatus('a', 'same', 'resolved');
  assert.equal(store.get('a', 'same').status, 'resolved');
  assert.equal(store.get('b', 'same').status, 'waiting');
  assert.equal(values.get('focus-and-follow-up.records').accounts.b.same.accountId, 'b');
  store.remove('a', 'same');
  assert.equal(store.get('a', 'same'), null);
  assert.equal(store.get('b', 'same').threadId, 'same');
});

test('separate configuration profiles do not share reminders', () => {
  const first = fixture();
  const second = fixture();
  first.store.track(thread('a', 'thread-1', '2026-10-16T09:00:00Z'));
  assert.equal(first.store.all(['a']).length, 1);
  assert.equal(second.store.all(['a']).length, 0);
  assert.notEqual(first.values, second.values);
});

test('newer received mail resolves only the matching waiting reminder', async () => {
  const { store, setRecent, setTracked } = fixture();
  const sentA = thread('a', 'same', '2026-10-16T09:00:00Z', '2026-10-15T09:00:00Z');
  const sentB = thread('b', 'same', '2026-10-16T09:00:00Z', '2026-10-15T09:00:00Z');
  store.track(sentA);
  store.track(sentB);
  setRecent([sentB]);
  setTracked([thread('a', 'same', '2026-10-16T09:00:00Z', '2026-10-16T09:30:00Z'), sentB]);
  store.active = true;
  await store.scan();
  assert.equal(store.get('a', 'same').status, 'resolved');
  assert.equal(store.get('b', 'same').status, 'waiting');
  assert.deepEqual(store.filterKeys('requires', ['a']), []);
  assert.deepEqual(store.filterKeys('requires', ['b']), [{ accountId: 'b', threadId: 'same' }]);
  store.stop();
});

test('filter query binds thread ids to their own account', () => {
  const filename = path.join(__dirname, '../focus-perspective.js');
  const module = { exports: {} };
  class Query {
    constructor() { this.clauses = []; }
    where(value) { this.clauses.push(['where', value]); return this; }
    whereAny(value) { this.clauses.push(['whereAny', value]); return this; }
    order() { return this; }
    limit() { return this; }
  }
  class MailboxPerspective { constructor(accountIds) { this.accountIds = accountIds; } }
  class And { constructor(children) { this.children = children; } }
  const attr = (name) => ({ equal: (value) => ({ name, value }), in: (value) => ({ name, value }),
    descending: () => ({ name }) });
  const exportsAPI = {
    MailboxPerspective,
    Matcher: { And },
    MutableQuerySubscription: class {},
    DatabaseStore: { findAll: () => new Query() },
    Thread: { attributes: {
      accountId: attr('accountId'), id: attr('id'), starred: attr('starred'),
      lastMessageReceivedTimestamp: attr('date'), categories: { contains: () => ({}) },
    } },
    CategoryStore: { getCategoryByRole: () => null },
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    module, exports: module.exports,
    require: (name) => name === 'mailspring-exports' ? exportsAPI : require(name),
  });
  const { FocusPerspective } = module.exports;
  const store = { filterKeys: () => [{ accountId: 'a', threadId: 'same' }] };
  const query = new FocusPerspective(['a', 'b'], 'pending', store).buildQuery();
  const accountGroups = query.clauses.find(([kind]) => kind === 'whereAny')[1];
  assert.equal(accountGroups.length, 1);
  assert.equal(JSON.stringify(accountGroups[0].children.map((matcher) => matcher.value)),
    JSON.stringify(['a', ['same']]));
});
