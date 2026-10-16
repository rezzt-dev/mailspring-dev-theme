const {
  MailboxPerspective, MutableQuerySubscription, DatabaseStore, Thread, CategoryStore, Matcher,
} = require('mailspring-exports');

const NAMES = {
  pending: 'pendientes',
  requires: 'requiere respuesta',
  important: 'importante',
  unreviewed: 'sin revisar',
};

class FocusPerspective extends MailboxPerspective {
  constructor(accountIds, filter, store) {
    super(accountIds);
    if (!NAMES[filter]) throw new Error('Filtro desconocido');
    this.filter = filter;
    this.store = store;
    this.name = NAMES[filter];
    this.iconName = 'starred.png';
    this.subscription = null;
  }

  emptyMessage() { return 'No hay conversaciones para este filtro'; }

  buildQuery() {
    let query = DatabaseStore.findAll(Thread).where({ inAllMail: true });
    if (!this.accountIds.length) return query.where({ id: '__focus_empty__' }).limit(0);
    query = query.where({ accountId: this.accountIds });
    if (this.filter === 'pending' || this.filter === 'requires') {
      const keys = this.store.filterKeys(this.filter, this.accountIds);
      const groups = this.accountIds.map((accountId) => ({
        accountId, ids: keys.filter((key) => key.accountId === accountId).map((key) => key.threadId),
      })).filter((group) => group.ids.length);
      query = groups.length ? query.whereAny(groups.map((group) => new Matcher.And([
        Thread.attributes.accountId.equal(group.accountId),
        Thread.attributes.id.in(group.ids),
      ]))) : query.where({ id: '__focus_empty__' });
    } else if (this.filter === 'unreviewed') {
      query = query.where({ unread: true });
    } else {
      const categories = this.accountIds.map((id) => CategoryStore.getCategoryByRole(id, 'important'))
        .filter(Boolean);
      query = query.whereAny([
        Thread.attributes.starred.equal(true),
        ...categories.map((category) => Thread.attributes.categories.contains(category.id)),
      ]);
    }
    return query.order(Thread.attributes.lastMessageReceivedTimestamp.descending()).limit(0);
  }

  threads() {
    this.subscription = new MutableQuerySubscription(this.buildQuery(), {
      emitResultSet: true,
      updateOnSeparateThread: true,
    });
    return this.subscription;
  }

  refresh() {
    if (!this.subscription) return;
    const range = this.subscription.query().range();
    this.subscription.replaceQuery(this.buildQuery().offset(range.offset).limit(range.limit));
  }
}

module.exports = { FocusPerspective, NAMES };
