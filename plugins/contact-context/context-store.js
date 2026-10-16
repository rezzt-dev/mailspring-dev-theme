const CONFIG_KEY = 'contact-context.records';
const MAX_NOTE = 4000;
const MAX_TAGS = 8;

function normalEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validRecord(value) {
  if (!value || typeof value !== 'object') return null;
  const note = typeof value.note === 'string' ? value.note.slice(0, MAX_NOTE) : '';
  const tags = Array.isArray(value.tags) ? [...new Set(value.tags
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim().toLowerCase().slice(0, 32))
    .filter(Boolean))].slice(0, MAX_TAGS) : [];
  return { note, tags };
}

class ContextStore {
  constructor(config) {
    this.config = config;
    this.accounts = {};
    this.listeners = new Set();
  }

  listen(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { this.listeners.forEach((listener) => listener()); }

  start() {
    this.subscription = this.config.observe(CONFIG_KEY, (raw) => {
      const accounts = {};
      if (raw && raw.version === 1 && raw.accounts && typeof raw.accounts === 'object') {
        Object.entries(raw.accounts).forEach(([accountId, contacts]) => {
          if (!contacts || typeof contacts !== 'object') return;
          accounts[accountId] = {};
          Object.entries(contacts).forEach(([email, record]) => {
            const clean = normalEmail(email);
            const valid = validRecord(record);
            if (clean && valid) accounts[accountId][clean] = valid;
          });
        });
      }
      this.accounts = accounts;
      this.emit();
    });
  }

  stop() {
    if (this.subscription) this.subscription.dispose();
    this.subscription = null;
    this.listeners.clear();
  }

  get(accountId, email) {
    return this.accounts[accountId] && this.accounts[accountId][normalEmail(email)] || { note: '', tags: [] };
  }

  save(accountId, email, value) {
    const key = normalEmail(email);
    if (!accountId || !key || !key.includes('@')) throw new Error('contacto o cuenta inválidos');
    const record = validRecord(value);
    if (!record) throw new Error('datos del contacto inválidos');
    const accounts = { ...this.accounts, [accountId]: { ...(this.accounts[accountId] || {}) } };
    if (record.note || record.tags.length) accounts[accountId][key] = record;
    else delete accounts[accountId][key];
    if (this.config.set(CONFIG_KEY, { version: 1, accounts }) === false) {
      throw new Error('no se pudieron guardar las notas locales');
    }
    this.accounts = accounts;
    this.emit();
    return record;
  }
}

module.exports = { ContextStore, normalEmail, validRecord, CONFIG_KEY };
