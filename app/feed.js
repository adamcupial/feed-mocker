import fs from 'fs';
import path from 'path';

import { logger } from './utils.js';
import { transform } from './template.js';

export class Feed {
  constructor (name, manifest, baseDir) {
    this.name = name;
    this.baseDir = baseDir;
    this.minDelay = (manifest.delays?.min) ? manifest.delays.min : 0;
    this.maxDelay = (manifest.delays?.max) ? manifest.delays.max : this.minDelay;
    this.wrapAround = manifest.wrapAround ?? false;
    this.pattern = (manifest.pattern) ? new RegExp(manifest.pattern) : /.*/;
    this.currentEvent = 0;
    this.events = manifest.events;
  }

  toString () {
    return `${this.name} feed mock
          delay: ${this.minDelay} - ${this.maxDelay}ms
        pattern: ${this.pattern.toString()}
    # of events: ${this.events.length}
     wrapAround: ${this.wrapAround}
    `;
  }

  async delay (ms) {
    logger.debug(`Delaying ${ms}ms`);
    return new Promise(resolve => setTimeout(() => { resolve(); }, ms));
  }

  useForUrl (url) {
    return this.pattern.test(url);
  }

  async getResponse () {
    const nextEvent = {
      statusCode: 404,
      headers: {},
      body: '',
    };

    let eventDelay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);

    if (this.currentEvent < this.events.length) {
      const { delay, file, body, statusCode, headers } = this.events[this.currentEvent];

      if (file) {
        nextEvent.body = fs.readFileSync(path.join(this.baseDir, file)).toString();
      } else if (body) {
        nextEvent.body = body;
      }

      nextEvent.body = transform(nextEvent.body);

      if (delay) {
        eventDelay = delay;
      }

      if (statusCode) {
        nextEvent.statusCode = statusCode;
      } else {
        nextEvent.statusCode = 200;
      }

      if (headers) {
        nextEvent.headers = headers;
      }

      if (!nextEvent.headers['Content-Type'] && file) {
        let ct = 'text/plain';

        switch (path.extname(file)) {
          case '.xml':
            ct = 'text/xml; charset=utf-8';
            break;
          case '.json':
            ct = 'application/json';
        }

        nextEvent.headers['Content-Type'] = ct;
      }

      this.currentEvent += 1;
    } else {
      if (this.wrapAround) {
        logger.debug(`${this.name}: end of recorded events, wrapping Around`);
        this.currentEvent = 0;
        return this.getResponse();
      } else {
        logger.debug(`${this.name}: end of recorded events`);
      }
    }

    if (!nextEvent.headers['Content-Length']) {
      nextEvent.headers['Content-Length'] = Buffer.byteLength(nextEvent.body || '');
    }

    if (!nextEvent.headers['Content-Type']) {
      nextEvent.headers['Content-Type'] = 'text/plain';
    }
    nextEvent.headers = Object.entries(nextEvent.headers);

    await this.delay(eventDelay);
    return nextEvent;
  }
}
