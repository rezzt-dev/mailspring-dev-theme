const SIDEBAR_SELECTOR = '.account-sidebar';
const ACCOUNT_LABEL_SELECTOR = '.account-sidebar-sections .outline-view .heading';
const originalLabels = new WeakMap();

let sidebarObserver = null;
let documentObserver = null;
let updateScheduled = false;

function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+$/.test(value.trim());
}

function forEachHeadingTextNode(heading, callback) {
  const walker = heading.ownerDocument.createTreeWalker(heading, 4);
  let textNode;

  while ((textNode = walker.nextNode())) {
    callback(textNode);
  }
}

function updateAccountLabels() {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll(`${SIDEBAR_SELECTOR} ${ACCOUNT_LABEL_SELECTOR}`).forEach((heading) => {
    forEachHeadingTextNode(heading, (textNode) => {
      const currentValue = textNode.nodeValue || '';
      const savedLabel = originalLabels.get(textNode);
      const original = savedLabel && currentValue === savedLabel.visible
        ? savedLabel.original
        : currentValue;

      if (!isEmailAddress(original)) {
        originalLabels.delete(textNode);
        return;
      }

      const visibleLabel = original.slice(0, original.indexOf('@')).trimEnd();
      originalLabels.set(textNode, { original, visible: visibleLabel });
      if (currentValue !== visibleLabel) {
        textNode.nodeValue = visibleLabel;
      }
    });
  });
}

function scheduleUpdate() {
  if (updateScheduled) {
    return;
  }

  updateScheduled = true;
  Promise.resolve().then(() => {
    updateScheduled = false;
    updateAccountLabels();
  });
}

function observeSidebar(sidebar) {
  sidebarObserver = new MutationObserver(scheduleUpdate);
  sidebarObserver.observe(sidebar, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  updateAccountLabels();
}

exports.activate = function activate() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return;
  }

  const sidebar = document.querySelector(SIDEBAR_SELECTOR);
  if (sidebar) {
    observeSidebar(sidebar);
    return;
  }

  documentObserver = new MutationObserver(() => {
    const mountedSidebar = document.querySelector(SIDEBAR_SELECTOR);
    if (!mountedSidebar) {
      return;
    }

    documentObserver.disconnect();
    documentObserver = null;
    observeSidebar(mountedSidebar);
  });
  documentObserver.observe(document.body, { childList: true, subtree: true });
};

exports.deactivate = function deactivate() {
  if (sidebarObserver) {
    sidebarObserver.disconnect();
    sidebarObserver = null;
  }
  if (documentObserver) {
    documentObserver.disconnect();
    documentObserver = null;
  }

  if (typeof document !== 'undefined') {
    document.querySelectorAll(`${SIDEBAR_SELECTOR} ${ACCOUNT_LABEL_SELECTOR}`).forEach((heading) => {
      forEachHeadingTextNode(heading, (textNode) => {
        if (originalLabels.has(textNode)) {
          textNode.nodeValue = originalLabels.get(textNode).original;
          originalLabels.delete(textNode);
        }
      });
    });
  }

  updateScheduled = false;
};
