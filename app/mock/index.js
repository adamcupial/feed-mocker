import path from 'path';
import http from 'http';
import { readFileSync } from 'fs';
import { FeedContainer } from './feed-container.js';
import { logger } from '../utils.js';

export function start (directory, port = 8080) {
  const manifest = JSON.parse(readFileSync(path.join(directory, 'manifest.json')));

  const feedContainer = new FeedContainer(manifest, directory);
  const server = http.createServer(async (req, res) => {
    const { statusCode, body, headers } = await feedContainer.getFeedResponseForUri(req.url);
    res.statusCode = statusCode;
    headers.forEach(([name, value]) => {
      res.setHeader(name, value);
    });
    res.end(body);
  });

  server.listen(port, () => {
    logger.info(`App listening on ${port}`);
  });
}
