// Quick Reference — cloud sync backend (Vercel Blob).
//
// Files are stored in Vercel Blob; a single JSON manifest blob holds the
// ordered card list (name, type, size, order, url). Viewing (GET) is public;
// every mutation (upload / rename / reorder / delete) requires the password in
// the `x-qref-password` header, matched against the QREF_ADMIN_PASSWORD env var.
//
// Required env (set in Vercel → Project → Settings → Environment Variables):
//   BLOB_READ_WRITE_TOKEN   — added automatically when a Blob store is linked.
//   QREF_ADMIN_PASSWORD     — the upload/edit password you choose.

import { put, del, list } from '@vercel/blob';

// Disable Vercel's automatic body parsing so we can read raw file bytes.
export const config = { api: { bodyParser: false } };

const MANIFEST = 'qref/manifest.json';
const MAX_BYTES = 4.4 * 1024 * 1024; // Vercel function payload ceiling (~4.5 MB)

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

function auth(req) {
  const pw = process.env.QREF_ADMIN_PASSWORD;
  if (!pw) return { code: 500, msg: 'Server not configured: set QREF_ADMIN_PASSWORD in Vercel.' };
  if ((req.headers['x-qref-password'] || '') !== pw) return { code: 401, msg: 'Wrong password.' };
  return null;
}

async function readManifest() {
  const { blobs } = await list({ prefix: MANIFEST });
  const found = blobs.find((b) => b.pathname === MANIFEST);
  if (!found) return [];
  try {
    const r = await fetch(found.url, { cache: 'no-store' });
    if (!r.ok) return [];
    const arr = await r.json();
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeManifest(arr) {
  await put(MANIFEST, JSON.stringify(arr), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
}

const sortCards = (a) => a.sort((x, y) => (x.order || 0) - (y.order || 0));
const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';

    // ---- GET: public list ----
    if (method === 'GET') {
      const cards = sortCards(await readManifest());
      return send(res, 200, { cards });
    }

    // Everything below mutates → requires the password.
    const denied = auth(req);
    if (denied) return send(res, denied.code, { error: denied.msg });

    // ---- POST: upload a new file ----
    if (method === 'POST') {
      const name = decodeURIComponent(req.headers['x-qref-name'] || 'Untitled');
      const type = req.headers['x-qref-type'] === 'pdf' ? 'pdf'
                 : req.headers['x-qref-type'] === 'image' ? 'image' : null;
      const mime = req.headers['content-type'] || 'application/octet-stream';
      if (!type) return send(res, 400, { error: 'Type must be pdf or image.' });

      const buf = await readRaw(req);
      if (!buf.length) return send(res, 400, { error: 'Empty upload.' });
      if (buf.length > MAX_BYTES) {
        return send(res, 413, { error: 'File too large for upload (max ~4.4 MB). Compress it and try again.' });
      }

      const id = newId();
      const ext = type === 'pdf' ? 'pdf' : (mime.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
      const stored = await put('qref/files/' + id + '.' + ext, buf, { access: 'public', contentType: mime });

      const cards = await readManifest();
      const maxOrder = cards.reduce((m, c) => Math.max(m, c.order || 0), 0);
      const card = {
        id, name, type, mime,
        size: buf.length,
        order: maxOrder + 1,
        createdAt: Date.now(),
        url: stored.url,
        pathname: stored.pathname,
      };
      cards.push(card);
      await writeManifest(cards);
      return send(res, 200, { card });
    }

    // ---- PATCH: rename or reorder ----
    if (method === 'PATCH') {
      let body;
      try { body = JSON.parse((await readRaw(req)).toString('utf8') || '{}'); }
      catch { return send(res, 400, { error: 'Bad JSON.' }); }
      const cards = await readManifest();

      if (body.action === 'rename') {
        const card = cards.find((c) => c.id === body.id);
        if (!card) return send(res, 404, { error: 'Not found.' });
        card.name = String(body.name || '').slice(0, 200) || card.name;
      } else if (body.action === 'reorder' && Array.isArray(body.ids)) {
        const pos = new Map(body.ids.map((id, i) => [id, i]));
        cards.forEach((c) => { if (pos.has(c.id)) c.order = pos.get(c.id); });
      } else {
        return send(res, 400, { error: 'Unknown action.' });
      }
      await writeManifest(sortCards(cards));
      return send(res, 200, { cards: sortCards(cards) });
    }

    // ---- DELETE: remove a file ----
    if (method === 'DELETE') {
      const url = new URL(req.url, 'http://x');
      const id = url.searchParams.get('id');
      if (!id) return send(res, 400, { error: 'Missing id.' });
      const cards = await readManifest();
      const card = cards.find((c) => c.id === id);
      if (card) {
        try { await del(card.url); } catch { /* already gone */ }
      }
      const next = cards.filter((c) => c.id !== id);
      await writeManifest(next);
      return send(res, 200, { cards: sortCards(next) });
    }

    res.setHeader('allow', 'GET, POST, PATCH, DELETE');
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (e) {
    return send(res, 500, { error: 'Server error: ' + (e && e.message ? e.message : String(e)) });
  }
}
