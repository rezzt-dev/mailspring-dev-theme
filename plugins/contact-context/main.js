const React = require('react');
const { AccountStore, ComponentRegistry, MessageStore } = require('mailspring-exports');
const { ContextStore, normalEmail } = require('./context-store');

const h = React.createElement;
let store = null;

exports.config = {
  records: { type: 'object', default: {} },
};

function time(value) {
  const date = value && new Date(value);
  return date && Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function threadStats(messages, email, accountEmail) {
  const target = normalEmail(email);
  const own = normalEmail(accountEmail);
  const relevant = (messages || []).filter((message) => {
    const contacts = [...(message.from || []), ...(message.to || []), ...(message.cc || [])];
    return contacts.some((contact) => normalEmail(contact.email) === target);
  });
  const received = relevant.filter((message) =>
    (message.from || []).some((contact) => normalEmail(contact.email) === target));
  const sent = relevant.filter((message) =>
    (message.from || []).some((contact) => normalEmail(contact.email) === own));
  const last = (items) => items.reduce((max, item) => Math.max(max, time(item.date)), 0);
  return { count: relevant.length, lastInteraction: last(relevant), lastSent: last(sent), received: received.length };
}

function formatted(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleString() : 'sin datos';
}

class ContactContext extends React.Component {
  static containerRequired = false;
  constructor(props) {
    super(props);
    this.state = { note: '', tags: '', dirty: false, error: '', saved: false };
  }
  componentDidMount() {
    this.unlistenStore = store.listen(() => this.forceUpdate());
    this.unlistenMessage = MessageStore.listen(() => this.forceUpdate());
    this.loadRecord();
  }
  componentDidUpdate() {
    if (this.loadedKey !== this.keyFor(this.props)) this.loadRecord();
  }
  componentWillUnmount() {
    this.unlistenStore();
    this.unlistenMessage();
  }
  keyFor(props) {
    const thread = MessageStore.thread();
    return thread && props.contact && `${thread.accountId}:${thread.id}:${normalEmail(props.contact.email)}`;
  }
  loadRecord() {
    const thread = MessageStore.thread();
    const contact = this.props.contact;
    this.loadedKey = this.keyFor(this.props);
    if (!thread || !contact) return;
    const record = store.get(thread.accountId, contact.email);
    this.setState({ note: record.note, tags: record.tags.join(', '), dirty: false, error: '', saved: false });
  }
  save() {
    const thread = MessageStore.thread();
    if (!thread || !this.props.contact) return;
    try {
      const record = store.save(thread.accountId, this.props.contact.email, {
        note: this.state.note,
        tags: this.state.tags.split(','),
      });
      this.setState({ note: record.note, tags: record.tags.join(', '), dirty: false, saved: true, error: '' });
    } catch (error) { this.setState({ error: error.message, saved: false }); }
  }
  render() {
    const thread = MessageStore.thread();
    const contact = this.props.contact;
    if (!thread || !contact || !AccountStore.accountForId(thread.accountId)) return null;
    const email = normalEmail(contact.email);
    if (!email) return null;
    const account = AccountStore.accountForId(thread.accountId);
    const stats = threadStats(MessageStore.items(), email, account.emailAddress);
    if (!stats.count) return null;
    const record = store.get(thread.accountId, email);
    return h('section', { className: 'rezzt-contact-context', 'aria-label': 'contexto del contacto' },
      h('h2', null, 'contexto del contacto'),
      h('p', { className: 'rezzt-context-email', title: email }, contact.name || email),
      h('small', null, email),
      h('dl', null,
        h('dt', null, 'mensajes en este hilo'), h('dd', null, String(stats.count)),
        h('dt', null, 'última interacción'), h('dd', null, formatted(stats.lastInteraction)),
        h('dt', null, 'último envío'), h('dd', null, formatted(stats.lastSent))),
      h('label', null, 'notas privadas', h('textarea', {
        value: this.state.note, maxLength: 4000, rows: 4,
        onChange: (event) => this.setState({ note: event.target.value, dirty: true, saved: false }),
      })),
      h('label', null, 'etiquetas (separadas por coma)', h('input', {
        type: 'text', value: this.state.tags,
        onChange: (event) => this.setState({ tags: event.target.value, dirty: true, saved: false }),
      })),
      h('div', { className: 'rezzt-context-actions' },
        h('button', { type: 'button', disabled: !this.state.dirty, onClick: () => this.save() }, 'guardar')),
      record.tags.length ? h('p', { className: 'rezzt-context-tags' }, record.tags.join(' · ')) : null,
      this.state.saved && h('small', { role: 'status' }, 'guardado localmente'),
      this.state.error && h('small', { role: 'alert' }, this.state.error));
  }
}

exports.activate = function activate() {
  if (store) return;
  store = new ContextStore(AppEnv.config);
  store.start();
  ComponentRegistry.register(ContactContext, { role: 'MessageListSidebar:ContactCard' });
};

exports.deactivate = function deactivate() {
  if (!store) return;
  ComponentRegistry.unregister(ContactContext);
  store.stop();
  store = null;
};

module.exports.threadStats = threadStats;
