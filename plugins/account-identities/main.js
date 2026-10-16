const React = require('react');
const { AccountStore, ComponentRegistry } = require('mailspring-exports');
const configuredIdentities = require('./identities.json');

const SIDEBAR_SELECTOR = '.account-sidebar';
const HEADING_SELECTOR = '.account-sidebar-sections .outline-view .heading';
const originalLabels = new WeakMap();
const originalTitles = new WeakMap();
let sidebarObserver = null;
let documentObserver = null;
let unsubscribeAccounts = null;
let observedSidebar = null;
let updateScheduled = false;
let active = false;

function identityFor(email) {
  const configured = configuredIdentities[(email || '').toLowerCase()] || {};
  const localPart = (email || '').split('@')[0];
  const alias = typeof configured.alias === 'string' && configured.alias.trim()
    ? configured.alias.trim() : localPart;
  const initial = typeof configured.initial === 'string' && configured.initial.trim()
    ? configured.initial.trim().slice(0, 2) : alias.slice(0, 1).toUpperCase();
  return {
    alias,
    initial,
    context: typeof configured.context === 'string' ? configured.context.trim() : '',
    indicator: ['white', 'gray', 'dim'].includes(configured.indicator)
      ? configured.indicator : 'gray',
  };
}

function headingTextNodes(heading) {
  const walker = heading.ownerDocument.createTreeWalker(heading, 4);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement.closest('.rezzt-account-identity')) nodes.push(node);
  }
  return nodes;
}

function restoreHeading(heading) {
  headingTextNodes(heading).forEach((node) => {
    const saved = originalLabels.get(node);
    if (!saved) return;
    if (node.nodeValue === saved.visible) node.nodeValue = saved.original;
    originalLabels.delete(node);
  });
  heading.querySelectorAll('.rezzt-account-identity').forEach((badge) => badge.remove());
  if (originalTitles.has(heading)) {
    const title = originalTitles.get(heading);
    if (title === null) heading.removeAttribute('title');
    else heading.setAttribute('title', title);
    originalTitles.delete(heading);
  }
}

function updateHeadings() {
  if (!active || typeof document === 'undefined') return;
  const accounts = AccountStore.accounts();
  document.querySelectorAll(`${SIDEBAR_SELECTOR} ${HEADING_SELECTOR}`).forEach((heading) => {
    const node = headingTextNodes(heading).find((candidate) => {
      const saved = originalLabels.get(candidate);
      const value = saved && candidate.nodeValue === saved.visible
        ? saved.original : candidate.nodeValue || '';
      return accounts.some((item) =>
        [item.label, item.emailAddress].some((label) => label && label.trim() === value.trim()));
    });
    if (!node) {
      restoreHeading(heading);
      return;
    }
    const saved = originalLabels.get(node);
    const current = node.nodeValue || '';
    const original = saved && current === saved.visible ? saved.original : current;
    const account = accounts.find((item) =>
      [item.label, item.emailAddress].some((value) => value && value.trim() === original.trim()));
    if (!account) {
      restoreHeading(heading);
      return;
    }

    const identity = identityFor(account.emailAddress);
    const visible = original.replace(original.trim(), identity.alias);
    originalLabels.set(node, { original, visible });
    if (current !== visible) node.nodeValue = visible;
    if (!originalTitles.has(heading)) originalTitles.set(heading, heading.getAttribute('title'));
    if (heading.getAttribute('title') !== account.emailAddress) heading.setAttribute('title', account.emailAddress);

    let badge = heading.querySelector('.rezzt-account-mark');
    if (!badge) {
      badge = heading.ownerDocument.createElement('span');
      badge.className = 'rezzt-account-identity rezzt-account-mark';
      badge.setAttribute('aria-hidden', 'true');
      heading.appendChild(badge);
    }
    if (badge.dataset.indicator !== identity.indicator) badge.dataset.indicator = identity.indicator;
    if (badge.textContent !== identity.initial) badge.textContent = identity.initial;
    let context = heading.querySelector('.rezzt-account-context');
    if (identity.context) {
      if (!context) {
        context = heading.ownerDocument.createElement('span');
        context.className = 'rezzt-account-identity rezzt-account-context';
        context.setAttribute('aria-hidden', 'true');
        heading.appendChild(context);
      }
      if (context.textContent !== identity.context) context.textContent = identity.context;
    } else if (context) context.remove();
  });
}

function scheduleUpdate() {
  if (updateScheduled) return;
  updateScheduled = true;
  Promise.resolve().then(() => {
    updateScheduled = false;
    updateHeadings();
  });
}

function observeSidebar(sidebar) {
  if (sidebarObserver) sidebarObserver.disconnect();
  observedSidebar = sidebar;
  sidebarObserver = new MutationObserver(scheduleUpdate);
  sidebarObserver.observe(sidebar, { childList: true, characterData: true, subtree: true });
  scheduleUpdate();
}

function ComposerIdentity({ draftFromEmail }) {
  if (!draftFromEmail) return null;
  const identity = identityFor(draftFromEmail);
  return React.createElement('span', {
    className: 'rezzt-composer-identity',
    title: draftFromEmail,
    'aria-label': `${identity.alias} (${draftFromEmail})${identity.context ? `, ${identity.context}` : ''}`,
  },
  React.createElement('span', {
    className: 'rezzt-composer-identity-mark',
    'data-indicator': identity.indicator,
    'aria-hidden': 'true',
  }, identity.initial),
  React.createElement('span', null, identity.alias),
  identity.context ? React.createElement('span', { className: 'rezzt-composer-identity-context' }, identity.context) : null);
}

exports.activate = function activate() {
  if (active) return;
  active = true;
  ComponentRegistry.register(ComposerIdentity, { role: 'Composer:FromFieldComponents' });
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  if (AccountStore.listen) unsubscribeAccounts = AccountStore.listen(scheduleUpdate);
  const sidebar = document.querySelector(SIDEBAR_SELECTOR);
  if (sidebar) observeSidebar(sidebar);
  documentObserver = new MutationObserver(() => {
    const mounted = document.querySelector(SIDEBAR_SELECTOR);
    if (mounted && mounted !== observedSidebar) observeSidebar(mounted);
  });
  documentObserver.observe(document.body, { childList: true, subtree: true });
};

exports.deactivate = function deactivate() {
  if (!active) return;
  active = false;
  ComponentRegistry.unregister(ComposerIdentity);
  if (sidebarObserver) sidebarObserver.disconnect();
  if (documentObserver) documentObserver.disconnect();
  if (unsubscribeAccounts) unsubscribeAccounts();
  sidebarObserver = documentObserver = unsubscribeAccounts = observedSidebar = null;
  if (typeof document !== 'undefined') {
    document.querySelectorAll(`${SIDEBAR_SELECTOR} ${HEADING_SELECTOR}`).forEach(restoreHeading);
  }
  updateScheduled = false;
};
