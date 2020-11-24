import httpProxy from 'http-proxy';
import http from 'http';
import zlib from 'zlib';

import { Record } from './record.js';
import { Manifest } from './manifest.js';
import { logger } from '../utils.js';

export function start (dir, port = 8080) {
  const manifest = new Manifest(dir);
  const proxy = httpProxy.createProxyServer({
    autoRewrite: true,
    selfHandleResponse: false,
  });

  proxy.on('proxyRes', (proxyRes, origReq) => {
    let body = Buffer.from('');
    let pipe;

    switch (proxyRes.headers['content-encoding']) {
      case 'gzip':
        pipe = zlib.createGunzip();
        proxyRes.pipe(pipe);
        break;
      case 'br':
        pipe = zlib.createBrotliDecompress();
        proxyRes.pipe(pipe);
        break;
      case 'deflate':
        pipe = zlib.createDeflate();
        proxyRes.pipe(pipe);
        break;
      default:
        pipe = proxyRes;
    }

    pipe.on('data', (chunk) => {
      body = Buffer.concat([body, chunk]);
    });

    pipe.on('end', () => {
      const headers = Object.fromEntries(
        Object.entries(proxyRes.headers)
          .filter(([k]) => ['content-length', 'content-encoding'].indexOf(k) === -1),
      );

      const record = new Record(body.toString(), headers, proxyRes.statusCode);

      manifest.addRecord(record);
      logger.info(`${origReq.url.slice(0, 20)}... => ${record.id} recorded`);
    });
  });

  http.createServer((req, res) => {
    proxy.web(req, res, {
      target: `http://${req.headers.host}`,
    });
  })
    .listen(port, () => {
      logger.info(`Proxy server started on port ${port}`);
    });
}
