const {
  Actions, AccountStore, ComponentRegistry, DatabaseStore, FocusedPerspectiveStore,
  Thread, WorkspaceStore,
} = require('mailspring-exports');
const { FocusStore } = require('./focus-store');
const { FocusPerspective } = require('./focus-perspective');
const { makeComponents } = require('./components');

exports.config = {
  records: { type: 'object', default: {} },
};

let store = null;
let components = null;
let unlisten = null;

exports.activate = function activate() {
  if (store) return;
  store = new FocusStore({
    config: AppEnv.config,
    database: DatabaseStore,
    Thread,
    accountStore: AccountStore,
  });
  components = makeComponents(store);
  ComponentRegistry.register(components.FocusSidebar, {
    location: WorkspaceStore.Location.RootSidebar,
  });
  ComponentRegistry.register(components.FocusFilterBar, {
    location: WorkspaceStore.Location.ThreadList.Toolbar,
  });
  ComponentRegistry.register(components.FollowUpQuickAction, { role: 'ThreadListQuickAction' });
  ComponentRegistry.register(components.FollowUpIndicator, { role: 'ThreadListIcon' });
  ComponentRegistry.register(components.FollowUpMessageActions, { role: 'MessageListHeaders' });
  unlisten = store.listen(() => {
    const current = FocusedPerspectiveStore.current();
    if (current instanceof FocusPerspective) current.refresh();
  });
  store.start();
};

exports.deactivate = function deactivate() {
  if (!store) return;
  const current = FocusedPerspectiveStore.current();
  if (current instanceof FocusPerspective) {
    Actions.focusDefaultMailboxPerspectiveForAccounts(current.accountIds);
  }
  [components.FocusSidebar, components.FocusFilterBar, components.FollowUpQuickAction,
    components.FollowUpIndicator, components.FollowUpMessageActions]
    .forEach((component) => ComponentRegistry.unregister(component));
  if (unlisten) unlisten();
  store.stop();
  unlisten = null;
  store = components = null;
};
