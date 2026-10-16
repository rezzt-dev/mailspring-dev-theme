const React = require('react');
const {
  AccountStore, Actions, DatabaseStore, Thread, FocusedPerspectiveStore,
} = require('mailspring-exports');
const { defaultDueAt, needsReply } = require('./focus-store');
const { FocusPerspective, NAMES } = require('./focus-perspective');

const h = React.createElement;

function localInput(iso) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function accountIdsForCurrentView() {
  const available = new Set(AccountStore.accounts().map((account) => account.id));
  const current = FocusedPerspectiveStore.current();
  const ids = current && current.accountIds ? current.accountIds.filter((id) => available.has(id)) : [];
  return ids.length ? ids : [...available];
}

function makeComponents(store) {
  let previousPerspective = null;

  function openFilter(filter, accountIds = accountIdsForCurrentView()) {
    const current = FocusedPerspectiveStore.current();
    if (!(current instanceof FocusPerspective)) previousPerspective = current;
    if (current instanceof FocusPerspective && current.filter === filter &&
        current.accountIds.join(',') === accountIds.join(',')) {
      current.refresh();
      return;
    }
    Actions.focusMailboxPerspective(new FocusPerspective(accountIds, filter, store));
  }

  function clearFilter() {
    const current = FocusedPerspectiveStore.current();
    if (!(current instanceof FocusPerspective)) return;
    const fallback = previousPerspective && previousPerspective.accountIds.every((id) =>
      AccountStore.accountForId(id)) ? previousPerspective : null;
    previousPerspective = null;
    if (fallback) Actions.focusMailboxPerspective(fallback);
    else Actions.focusDefaultMailboxPerspectiveForAccounts(current.accountIds);
  }

  async function openOriginal(record) {
    const thread = await DatabaseStore.find(Thread, record.threadId);
    if (!thread || thread.accountId !== record.accountId) {
      throw new Error('El correo ya no está disponible en esta cuenta');
    }
    Actions.popoutThread(thread);
  }

  class FocusFilterBar extends React.Component {
    static containerRequired = false;
    componentDidMount() {
      this.unlistenStore = store.listen(() => this.forceUpdate());
      this.unlistenPerspective = FocusedPerspectiveStore.listen(() => this.forceUpdate());
    }
    componentWillUnmount() {
      this.unlistenStore();
      this.unlistenPerspective();
    }
    render() {
      const current = FocusedPerspectiveStore.current();
      return h('div', { className: 'rezzt-focus-filters', 'aria-label': 'filtros de productividad' },
        ...['requires', 'important', 'unreviewed', 'pending'].map((filter) => h('button', {
          key: filter, type: 'button',
          className: current instanceof FocusPerspective && current.filter === filter ? 'active' : '',
          'aria-pressed': current instanceof FocusPerspective && current.filter === filter,
          onClick: () => openFilter(filter),
        }, NAMES[filter])),
        current instanceof FocusPerspective && h('button', {
          type: 'button', onClick: clearFilter, title: 'volver a la vista anterior',
        }, 'volver'));
    }
  }

  class FollowUpQuickAction extends React.Component {
    static containerRequired = false;
    componentDidMount() { this.unlisten = store.listen(() => this.forceUpdate()); }
    componentWillUnmount() { this.unlisten(); }
    render() {
      const { thread } = this.props;
      if (!thread || !thread.accountId) return null;
      const record = store.get(thread.accountId, thread.id);
      const open = record && !['resolved', 'archived'].includes(record.status);
      const label = open ? 'resolver seguimiento' : 'recordar mañana';
      return h('button', {
        type: 'button', className: 'rezzt-focus-quick-action',
        style: { order: 90 }, title: label, 'aria-label': label,
        onClick: (event) => {
          event.stopPropagation();
          if (open) store.setStatus(thread.accountId, thread.id, 'resolved');
          else store.track(thread);
        },
        onKeyDown: (event) => event.stopPropagation(),
      }, open ? '✓' : '+');
    }
  }

  class FollowUpIndicator extends React.Component {
    static containerRequired = false;
    componentDidMount() { this.unlisten = store.listen(() => this.forceUpdate()); }
    componentWillUnmount() { this.unlisten(); }
    render() {
      const { thread } = this.props;
      if (!thread || !thread.accountId) return null;
      const record = store.get(thread.accountId, thread.id);
      const open = record && !['resolved', 'archived'].includes(record.status);
      const automatic = !open && needsReply(thread) && store.waitingThreads([thread.accountId])
        .some((candidate) => candidate.id === thread.id);
      const overdue = open && new Date(record.dueAt).getTime() <= Date.now();
      const label = open ? 'resolver seguimiento' : 'recordar mañana';
      const state = overdue ? 'seguimiento vencido' : open ? 'seguimiento pendiente'
        : automatic ? 'en espera de respuesta' : 'sin seguimiento';
      return h('button', {
        type: 'button', className: `rezzt-follow-up-indicator${overdue ? ' overdue' : ''}${!open && !automatic ? ' idle' : ''}`,
        title: `${state} · ${label}`, 'aria-label': `${state}; ${label}`,
        onClick: (event) => {
          event.stopPropagation();
          if (open) store.setStatus(thread.accountId, thread.id, 'resolved');
          else store.track(thread);
        },
        onKeyDown: (event) => event.stopPropagation(),
      }, overdue ? '!' : open || automatic ? '·' : '+');
    }
  }

  class FollowUpMessageActions extends React.Component {
    static containerRequired = false;
    constructor(props) {
      super(props);
      const record = props.thread && store.get(props.thread.accountId, props.thread.id);
      this.state = { due: localInput(record ? record.dueAt : defaultDueAt()), error: '' };
    }
    componentDidMount() { this.unlisten = store.listen(() => this.forceUpdate()); }
    componentWillUnmount() { this.unlisten(); }
    componentDidUpdate(previous) {
      if (this.props.thread && (!previous.thread ||
          previous.thread.id !== this.props.thread.id ||
          previous.thread.accountId !== this.props.thread.accountId)) {
        const record = store.get(this.props.thread.accountId, this.props.thread.id);
        this.setState({ due: localInput(record ? record.dueAt : defaultDueAt()), error: '' });
      }
    }
    render() {
      const { thread } = this.props;
      if (!thread || !thread.accountId) return null;
      const record = store.get(thread.accountId, thread.id);
      return h('section', { className: 'rezzt-focus-message-actions', 'aria-label': 'seguimiento' },
        h('span', { className: 'rezzt-focus-label' }, 'seguimiento'),
        h('input', { type: 'datetime-local', value: this.state.due,
          'aria-label': 'fecha y hora del recordatorio',
          onChange: (event) => this.setState({ due: event.target.value, error: '' }),
        }),
        h('button', { type: 'button', onClick: () => {
          const due = new Date(this.state.due);
          if (!this.state.due || !Number.isFinite(due.getTime())) {
            this.setState({ error: 'elige una fecha válida' });
            return;
          }
          try {
            store.track(thread, due.toISOString());
            this.setState({ error: '' });
          } catch (error) { this.setState({ error: error.message }); }
        } }, record ? 'actualizar' : 'recordar'),
        record && h('select', {
          value: record.status, 'aria-label': 'estado del seguimiento',
          onChange: (event) => store.setStatus(thread.accountId, thread.id, event.target.value),
        }, ...[
          ['pending', 'pendiente'], ['waiting', 'en espera'],
          ['resolved', 'resuelto'], ['archived', 'archivado'],
        ].map(([value, label]) => h('option', { key: value, value }, label))),
        record && h('button', { type: 'button', onClick: () => store.remove(thread.accountId, thread.id) }, 'quitar'),
        this.state.error && h('span', { role: 'alert' }, this.state.error));
    }
  }

  class FocusSidebar extends React.Component {
    static containerRequired = false;
    constructor(props) {
      super(props);
      this.state = { accountId: 'current', showClosed: false, error: '' };
    }
    componentDidMount() {
      this.unlistenStore = store.listen(() => this.forceUpdate());
      this.unlistenAccounts = AccountStore.listen(() => this.forceUpdate());
      this.unlistenPerspective = FocusedPerspectiveStore.listen(() => this.forceUpdate());
    }
    componentWillUnmount() {
      this.unlistenStore(); this.unlistenAccounts(); this.unlistenPerspective();
    }
    scopeIds() {
      return this.state.accountId === 'current' || !AccountStore.accountForId(this.state.accountId)
        ? accountIdsForCurrentView() : [this.state.accountId];
    }
    render() {
      const accountIds = this.scopeIds();
      const accounts = AccountStore.accounts();
      const labels = Object.fromEntries(accounts.map((account) => [account.id, account.label || account.emailAddress]));
      const records = store.all(accountIds, this.state.showClosed);
      const suggestions = store.waitingThreads(accountIds)
        .filter((thread) => !store.get(thread.accountId, thread.id)).slice(0, 4);
      return h('section', { className: 'rezzt-focus-sidebar', 'aria-label': 'centro de seguimiento' },
        h('div', { className: 'rezzt-focus-heading' },
          h('strong', null, `pendientes ${store.all(accountIds).length}`),
          h('button', { type: 'button', onClick: () => openFilter('pending', accountIds) }, 'ver lista')),
        h('select', {
          value: this.state.accountId, 'aria-label': 'cuenta de los seguimientos',
          onChange: (event) => this.setState({ accountId: event.target.value }),
        }, h('option', { value: 'current' }, 'cuentas visibles'),
        ...accounts.map((account) => h('option', { key: account.id, value: account.id }, labels[account.id]))),
        h('div', { className: 'rezzt-focus-tasks' },
          ...records.slice(0, 8).map((record) => h('div', {
            className: 'rezzt-focus-task', key: `${record.accountId}:${record.threadId}`,
          },
          h('button', { type: 'button', className: 'rezzt-focus-subject',
            title: 'abrir correo original', onClick: async () => {
              try { await openOriginal(record); this.setState({ error: '' }); }
              catch (error) { this.setState({ error: error.message }); }
            },
          }, record.subject || '(sin asunto)'),
          h('small', null, `${labels[record.accountId] || record.accountId} · ${new Date(record.dueAt).toLocaleString()} · ${{
            pending: 'pendiente', waiting: 'en espera', resolved: 'resuelto', archived: 'archivado',
          }[record.status]}`),
          h('select', { value: record.status, 'aria-label': `estado de ${record.subject}`,
            onChange: (event) => store.setStatus(record.accountId, record.threadId, event.target.value),
          }, ...[
            ['pending', 'pendiente'], ['waiting', 'en espera'],
            ['resolved', 'resuelto'], ['archived', 'archivado'],
          ].map(([value, label]) => h('option', { key: value, value }, label))),
          h('button', { type: 'button', onClick: () => store.remove(record.accountId, record.threadId),
            'aria-label': `quitar ${record.subject}` }, '×'))),
          records.length === 0 && h('p', null, 'sin recordatorios en estas cuentas')),
        suggestions.length > 0 && h('div', { className: 'rezzt-focus-suggestions' },
          h('strong', null, 'en espera de respuesta'),
          ...suggestions.map((thread) => h('div', { key: `${thread.accountId}:${thread.id}` },
            h('span', { title: labels[thread.accountId] }, thread.subject || '(sin asunto)'),
            h('button', { type: 'button', onClick: () => store.track(thread) }, 'recordar')))),
        h('button', { type: 'button', className: 'rezzt-focus-closed-toggle',
          onClick: () => this.setState({ showClosed: !this.state.showClosed }),
        }, this.state.showClosed ? 'ocultar cerrados' : 'mostrar cerrados'),
        this.state.error && h('p', { role: 'alert' }, this.state.error));
    }
  }

  return { FocusFilterBar, FollowUpQuickAction, FollowUpIndicator,
    FollowUpMessageActions, FocusSidebar, openFilter, clearFilter };
}

module.exports = { makeComponents };
