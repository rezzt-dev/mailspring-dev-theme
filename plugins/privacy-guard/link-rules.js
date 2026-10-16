const TRACKING_KEYS = new Set([
  'fbclid', 'gclid', 'dclid', 'msclkid', 'igshid', 'mc_cid', 'mc_eid',
  'mkt_tok', 'yclid', '_hsenc', '_hsmi', 'vero_id', 'wickedid',
]);

function inspectLink(raw) {
  if (typeof raw !== 'string' || raw.length > 8192) return null;
  let url;
  try { url = new URL(raw); } catch (_) { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const removed = [];
  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith('utm_') || TRACKING_KEYS.has(lower)) {
      removed.push(key);
      url.searchParams.delete(key);
    }
  }
  return { original: raw, clean: removed.length ? url.href : raw, removed };
}

function remoteImages(body) {
  if (typeof body !== 'string') return { images: 0, possiblePixels: 0 };
  let images = 0;
  let possiblePixels = 0;
  const imageTag = /<img\b[^>]*>/gi;
  for (const tag of body.match(imageTag) || []) {
    const src = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!src || !/^https?:\/\//i.test(src[1] || src[2] || src[3])) continue;
    images += 1;
    const width = tag.match(/\bwidth\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const height = tag.match(/\bheight\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const dimension = (match) => match && /^1(?:px)?$/i.test(match[1] || match[2] || match[3]);
    if (dimension(width) && dimension(height)) possiblePixels += 1;
  }
  return { images, possiblePixels };
}

module.exports = { inspectLink, remoteImages };
