const CONFIG_KEY = 'focus-and-follow-up.records';
const STATUSES = ['pending', 'waiting', 'resolved', 'archived'];
const SCAN_LIMIT = 1000;
const SCAN_DAYS = 180;

function timestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function needsReply(thread) {
  const sent = timestamp(thread && thread.lastMessageSentTimestamp);
  const received = timestamp(thread && thread.lastMessageReceivedTimestamp);
  return sent > 0 && sent > received && thread.inAllMail !== false;
}

function defaultDueAt(now = new Date()) {
  const due = new Date(now);
  due.setDate(due.getDate() + 1);
  due.setHours(9, 0, 0, 0);
  if (due.getTime() <= now.getTime()) due.setDate(due.getDate() + 1);
  return due.toISOString();
}

function validRecord(value, accountId, threadId) {
  if (!value || typeof value !== 'object') return null;
  if (value.accountId !== accountId || value.threadId !== threadId) return null;
  if (!STATUSES.includes(value.status)) return null;
  if (!timestamp(value.dueAt)) return null;
  return {
    accountId, threadId,
    subject: typeof value.subject === 'string' ? value.subject.slice(0, 300) : '',
    dueAt: new Date(value.dueAt).toISOString(),
    status: value.status,
    createdAt: timestamp(value.createdAt) ? new Date(value.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: timestamp(value.updatedAt) ? new Date(value.updatedAt).toISOString() : new Date().toISOString(),
    sentAt: timestamp(value.sentAt) ? new Date(value.sentAt).toISOString() : null,
  };
}

class FocusStore {
  constructor({ config, database, Thread, accountStore, now = () => new Date() }) {
    this.config = config;
    this.database = database;
    this.Thread = Thread;
    this.accountStore = accountStore;
    this.now = now;
    this.accounts = {};
    this.candidates = [];
    this.listeners = new Set();
    this.scanTimer = null;
    this.tickTimer = null;
    this.scanSequence = 0;
    this.active = false;
  }

  listen(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() { this.listeners.forEach((listener) => listener()); }

  load(raw) {
    const accounts = {};
    if (raw && raw.version === 1 && raw.accounts && typeof raw.accounts === 'object') {
      Object.entries(raw.accounts).forEach(([accountId, records]) => {
        if (!records || typeof records !== 'object') return;
        const normalized = {};
        Object.entries(records).forEach(([threadId, value]) => {
          const record = validRecord(value, accountId, threadId);
          if (record) normalized[threadId] = record;
        });
        accounts[accountId] = normalized;
      });
    }
    this.accounts = accounts;
    this.emit();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.configSubscription = this.config.observe(CONFIG_KEY, (value) => this.load(value));
    this.databaseUnlisten = this.database.listen(() => this.scheduleScan());
    this.accountUnlisten = this.accountStore.listen(() => this.scheduleScan());
    this.tickTimer = setInterval(() => this.emit(), 60000);
    this.scheduleScan(0);
  }

  stop() {
    this.active = false;
    this.scanSequence += 1;
    clearTimeout(this.scanTimer);
    clearInterval(this.tickTimer);
    if (this.configSubscription) this.configSubscription.dispose();
    if (this.databaseUnlisten) this.databaseUnlisten();
    if (this.accountUnlisten) this.accountUnlisten();
    this.configSubscription = this.databaseUnlisten = this.accountUnlisten = null;
    this.candidates = [];
    this.listeners.clear();
  }

  persist() {
    const saved = this.config.set(CONFIG_KEY, { version: 1, accounts: this.accounts });
    if (saved === false) throw new Error('No se pudo guardar el recordatorio local');
    this.emit();
  }

  get(accountId, threadId) {
    return this.accounts[accountId] && this.accounts[accountId][threadId] || null;
  }

  all(accountIds, includeClosed = false) {
    const allowed = new Set(accountIds);
    return Object.entries(this.accounts).filter(([accountId]) => allowed.has(accountId))
      .flatMap(([, records]) => Object.values(records))
      .filter((record) => includeClosed || !['resolved', 'archived'].includes(record.status))
      .sort((a, b) => timestamp(a.dueAt) - timestamp(b.dueAt));
  }

  track(thread, dueAt = defaultDueAt(this.now())) {
    if (!thread || !thread.accountId || !thread.id || !timestamp(dueAt)) {
      throw new Error('El hilo y una fecha válida son necesarios');
    }
    const previous = this.get(thread.accountId, thread.id);
    const time = this.now().toISOString();
    const record = {
      accountId: thread.accountId,
      threadId: thread.id,
      subject: String(thread.subject || '').slice(0, 300),
      dueAt: new Date(dueAt).toISOString(),
      status: previous && !['resolved', 'archived'].includes(previous.status)
        ? previous.status : needsReply(thread) ? 'waiting' : 'pending',
      createdAt: previous ? previous.createdAt : time,
      updatedAt: time,
      sentAt: timestamp(thread.lastMessageSentTimestamp)
        ? new Date(thread.lastMessageSentTimestamp).toISOString() : null,
    };
    this.accounts[thread.accountId] = { ...this.accounts[thread.accountId], [thread.id]: record };
    this.persist();
    return record;
  }

  setStatus(accountId, threadId, status) {
    if (!STATUSES.includes(status)) throw new Error('Estado inválido');
    const record = this.get(accountId, threadId);
    if (!record) return false;
    this.accounts[accountId] = {
      ...this.accounts[accountId],
      [threadId]: { ...record, status, updatedAt: this.now().toISOString() },
    };
    this.persist();
    return true;
  }

  remove(accountId, threadId) {
    if (!this.get(accountId, threadId)) return false;
    const next = { ...this.accounts[accountId] };
    delete next[threadId];
    this.accounts[accountId] = next;
    this.persist();
    return true;
  }

  waitingThreads(accountIds) {
    const allowed = new Set(accountIds);
    return this.candidates.filter((thread) => allowed.has(thread.accountId) &&
      !['resolved', 'archived'].includes((this.get(thread.accountId, thread.id) || {}).status));
  }

  filterKeys(filter, accountIds) {
    if (filter === 'pending') return this.all(accountIds)
      .map((record) => ({ accountId: record.accountId, threadId: record.threadId }));
    if (filter === 'requires') {
      const keys = this.waitingThreads(accountIds)
        .map((thread) => ({ accountId: thread.accountId, threadId: thread.id }));
      this.all(accountIds).filter((record) => record.status === 'waiting')
        .forEach((record) => keys.push({ accountId: record.accountId, threadId: record.threadId }));
      return [...new Map(keys.map((key) => [JSON.stringify([key.accountId, key.threadId]), key])).values()];
    }
    return [];
  }

  scheduleScan(delay = 4000) {
    if (!this.active) return;
    clearTimeout(this.scanTimer);
    this.scanTimer = setTimeout(() => this.scan(), delay);
  }

  async scan() {
    if (!this.active) return;
    const sequence = ++this.scanSequence;
    const accountIds = this.accountStore.accounts().map((account) => account.id);
    if (!accountIds.length) {
      this.candidates = [];
      this.emit();
      return;
    }
    try {
      const cutoff = new Date(this.now().getTime() - SCAN_DAYS * 86400000);
      const recent = await this.database.findAll(this.Thread)
        .where({ accountId: accountIds, inAllMail: true })
        .where(this.Thread.attributes.lastMessageSentTimestamp.greaterThan(cutoff))
        .order(this.Thread.attributes.lastMessageSentTimestamp.descending())
        .limit(SCAN_LIMIT);
      if (!this.active || sequence !== this.scanSequence) return;
      const allowed = new Set(accountIds);
      this.candidates = recent.filter((thread) => allowed.has(thread.accountId) && needsReply(thread));

      const ids = Object.values(this.accounts).flatMap((records) => Object.keys(records));
      if (ids.length) {
        const tracked = await this.database.findAll(this.Thread).where({ id: ids });
        if (!this.active || sequence !== this.scanSequence) return;
        let changed = false;
        tracked.forEach((thread) => {
          const record = this.get(thread.accountId, thread.id);
          if (!record) return;
          if (record.status === 'waiting' && !needsReply(thread) &&
              timestamp(thread.lastMessageReceivedTimestamp) > timestamp(record.sentAt)) {
            this.accounts[thread.accountId][thread.id] = {
              ...record, status: 'resolved', updatedAt: this.now().toISOString(),
            };
            changed = true;
          }
        });
        if (changed) this.persist();
      }
      this.emit();
    } catch (error) {
      console.error('focus-and-follow-up: no se pudo actualizar la detección de respuestas', error);
    }
  }
}

module.exports = { FocusStore, needsReply, defaultDueAt, CONFIG_KEY };
