#!/usr/bin/env node
const http = require('http');
const { randomBytes } = require('crypto');

const PORT = process.env.PORT || 3001;

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function text(res, status, txt) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(txt),
  });
  res.end(txt);
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const path = url.pathname.replace(/^\/+/, ''); // 'hi', 'z', etc

    // simple health
    if (req.method === 'GET' && (path === '' || path === '/')) {
      return json(res, 200, { ok: true, api: 'sketch-minimal' });
    }

    if (req.method === 'POST' && path === 'hi') {
      const buf = await collectBody(req);
      const body = buf.toString('utf8');
      // if client sends a key, return a token
      const token = 'tk-' + randomBytes(6).toString('hex');
      return json(res, 200, { success: true, token });
    }

    if (req.method === 'POST' && path === 'sketchVersion') {
      const buf = await collectBody(req);
      let payload = {};
      try {
        payload = JSON.parse(buf.toString('utf8'));
      } catch (e) {}
      const currentVersion = payload.currentVersion || 'unknown';
      return json(res, 200, {
        outdated: false,
        sketchUpdated: true,
        latestVersion: currentVersion,
        updateURL: '/',
      });
    }

    if (req.method === 'POST' && path === 'slop') {
      const token = req.headers['x-token'];
      if (!token) return text(res, 403, 'missing token');
      await collectBody(req);
      return json(res, 200, { success: true });
    }

    if (req.method === 'POST' && path === 'to') {
      const token = req.headers['x-token'];
      if (!token) return text(res, 403, 'missing token');
      await collectBody(req);
      return json(res, 200, { success: true });
    }

    if (req.method === 'GET' && path === 'z') {
      const token = req.headers['x-token'];
      if (!token) return text(res, 403, 'missing token');

      // return source + JSON mapping as a single ArrayBuffer-like body
      const source = `// mocked game source\nwindow.__SKETCH_MOCK__ = true;\n`;
      const renamed = { someOldName: 'someNewName' };
      const srcBuf = Buffer.from(source, 'utf8');
      const mapBuf = Buffer.from(JSON.stringify(renamed), 'utf8');
      const out = Buffer.concat([srcBuf, mapBuf]);

      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': out.length,
        'x-src': String(srcBuf.length),
      });
      return res.end(out);
    }

    if (req.method === 'POST' && path === 'cc') {
      const token = req.headers['x-token'];
      if (!token) return text(res, 403, 'missing token');
      const buf = await collectBody(req);
      try {
        console.log('[cc report]', buf.toString('utf8').slice(0, 200));
      } catch (e) {}
      return json(res, 200, { success: true });
    }

    // default: return 404
    text(res, 404, 'not found');
  } catch (err) {
    console.error(err);
    text(res, 500, 'server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Sketch minimal API listening at http://127.0.0.1:${PORT}/`);
});
