const test = require('node:test');
const assert = require('node:assert/strict');
const { inspectLink, remoteImages } = require('../link-rules');

test('removes only known tracking parameters while retaining destination and other data', () => {
  const result = inspectLink('https://example.com/a?q=one&utm_source=mail&FBCLID=abc#part');
  assert.equal(result.clean, 'https://example.com/a?q=one#part');
  assert.deepEqual(result.removed, ['utm_source', 'FBCLID']);
  assert.equal(result.original, 'https://example.com/a?q=one&utm_source=mail&FBCLID=abc#part');
  assert.equal(inspectLink('javascript:alert(1)'), null);
  assert.equal(inspectLink('file:///tmp/a'), null);
});

test('counts remote images and reports one pixel candidates as hints', () => {
  assert.deepEqual(remoteImages('<img src="https://x.test/p" width="1" height="1"><img src="cid:x">'),
    { images: 1, possiblePixels: 1 });
});
